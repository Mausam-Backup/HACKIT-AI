import asyncio
import json
import random
import sys
import time
import uuid
import httpx

from terminal_safe import graceful_terminate


class OpencodeStuck(Exception):
    pass


def _extract_text(data) -> str:
    if isinstance(data, str):
        return data
    if isinstance(data, list):
        return "".join([_extract_text(item) for item in data if item])
    if not isinstance(data, dict):
        return ""

    extracted = []
    for key in ("text", "content", "value", "delta", "output", "reasoning"):
        val = data.get(key)
        if isinstance(val, str) and val.strip():
            extracted.append(val)
        elif isinstance(val, list):
            sub = _extract_text(val)
            if sub.strip():
                extracted.append(sub)

    if extracted:
        return "".join(extracted)

    parts = data.get("parts")
    if isinstance(parts, list):
        sub = _extract_text(parts)
        if sub.strip():
            return sub

    return ""


class TimeoutTracker:
    """Tracks per-agent response times and computes smart dynamic timeouts.

    For each agent, maintains a sliding window of historical response times
    and computes: timeout = max(base_min, min(max_limit, historical_avg * multiplier)).
    On retries, uses exponential backoff with jitter.
    """

    def __init__(self, base_timeout: int = 1800, max_timeout: int = 3600,
                 multiplier: float = 3.0, backoff_base: float = 2.0,
                 backoff_cap: int = 120):
        self.base_timeout = base_timeout
        self.max_timeout = max_timeout
        self.multiplier = multiplier
        self.backoff_base = backoff_base
        self.backoff_cap = backoff_cap
        self.history: dict[str, list[float]] = {}

    def record(self, agent: str, elapsed: float):
        if agent not in self.history:
            self.history[agent] = []
        self.history[agent].append(elapsed)
        # Keep last 10 entries
        if len(self.history[agent]) > 10:
            self.history[agent] = self.history[agent][-10:]

    def get_timeout(self, agent: str) -> int:
        hist = self.history.get(agent, [])
        if not hist:
            return self.base_timeout
        avg = sum(hist) / len(hist)
        dynamic = int(avg * self.multiplier)
        return min(self.max_timeout, max(self.base_timeout, dynamic))

    def get_retry_delay(self, attempt: int) -> float:
        backoff = min(self.backoff_cap, self.backoff_base ** attempt)
        jitter = random.uniform(0, 1)
        return backoff + jitter

    def to_dict(self) -> dict:
        return {"history": self.history}

    @classmethod
    def from_dict(cls, data: dict, **kwargs) -> "TimeoutTracker":
        t = cls(**kwargs)
        t.history = data.get("history", {})
        return t


class OpencodeClient:
    API_SEMAPHORE = asyncio.Semaphore(2)

    def __init__(self, port: int, project_dir: str, timeout: int = 1800,
                 strict_models: bool = False,
                 timeout_tracker: TimeoutTracker | None = None,
                 ws_broadcast=None):
        self.port = port
        self.project_dir = project_dir
        self.timeout = timeout
        self.strict_models = strict_models
        self.timeout_tracker = timeout_tracker or TimeoutTracker()
        self.ws_broadcast = ws_broadcast
        self.process = None
        self.client = None
        self.base_url = f"http://127.0.0.1:{port}"
        # Session reuse: keep session across retries for the same agent call
        self._current_session_id: str | None = None
        self._current_agent: str | None = None

    async def _drain_pipe(self, stream: asyncio.StreamReader | None, name: str):
        if stream is None:
            return
        try:
            while True:
                line = await stream.readline()
                if not line:
                    break
        except Exception:
            pass

    async def start(self, wait_timeout: int = 60):
        self.client = httpx.AsyncClient(base_url=self.base_url, timeout=httpx.Timeout(1800.0, connect=60.0))

        # Check if an opencode server is already running on this port
        try:
            resp = await self.client.get("/global/health")
            if resp.json().get("healthy"):
                return
        except Exception:
            pass

        exe = "opencode.cmd" if sys.platform == "win32" else "opencode"
        self.process = await asyncio.create_subprocess_exec(
            exe, "serve", "--port", str(self.port),
            cwd=self.project_dir,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        self._drain_tasks = [
            asyncio.create_task(self._drain_pipe(self.process.stdout, "stdout")),
            asyncio.create_task(self._drain_pipe(self.process.stderr, "stderr")),
        ]

        start = time.time()
        while time.time() - start < wait_timeout:
            try:
                resp = await self.client.get("/global/health")
                if resp.json().get("healthy"):
                    return
            except Exception:
                pass
            await asyncio.sleep(1)

        raise TimeoutError("opencode server did not start within 60s")

    async def verify_healthy(self):
        if self.client is None:
            raise RuntimeError("Client not started")
        resp = await self.client.get("/global/health")
        if not resp.json().get("healthy"):
            raise ConnectionError("Server not healthy")

    async def verify_models(self, models: dict[str, str]):
        try:
            exe = "opencode.cmd" if sys.platform == "win32" else "opencode"
            proc = await asyncio.create_subprocess_exec(
                exe, "models",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=15)
            available = set(stdout.decode(errors="replace").strip().splitlines())
            for agent, slug in models.items():
                if slug not in available:
                    msg = f"model '{slug}' for agent '{agent}' not found (run `opencode models` to list)"
                    if self.strict_models:
                        raise RuntimeError(msg)
                    print(f"  WARNING: {msg}", flush=True)
                    print("  Pipeline will continue — if agent fails, verify with `opencode models`", flush=True)
                else:
                    print(f"  [model] {agent} -> {slug} OK", flush=True)
        except RuntimeError:
            raise
        except Exception as e:
            msg = f"model verification skipped ({e})"
            if self.strict_models:
                raise RuntimeError(msg)
            print(f"  WARNING: {msg}", flush=True)

    def _get_agent_config(self, agent: str) -> tuple[int, int]:
        """Returns (dynamic_timeout, max_retries) for the given agent."""
        max_retries = 2 if agent in ("frontend", "backend", "coach") else 1
        timeout = self.timeout_tracker.get_timeout(agent)
        return timeout, max_retries

    async def _ensure_session(self, agent: str | None = None) -> str:
        if agent is not None and self._current_session_id is not None and self._current_agent == agent:
            return self._current_session_id
        session_id = str(uuid.uuid4())
        resp = await self.client.post(
            "/session",
            json={"title": f"app-builder-{session_id[:8]}"},
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        session_id = data["id"]
        self._current_session_id = session_id
        self._current_agent = agent
        return session_id

    async def _delete_session(self, session_id: str):
        try:
            await self.client.delete(f"/session/{session_id}", timeout=60)
        except Exception:
            pass

    async def _run_one(self, agent: str, message: str, line_timeout: int | None = None, skip_fast_check: bool = True) -> str:
        total_timeout, max_retries = self._get_agent_config(agent)
        last_err = None

        for attempt in range(1, max_retries + 1):
            retry_delay = self.timeout_tracker.get_retry_delay(attempt - 1)
            print(f"    [{agent}] attempt {attempt}/{max_retries} (timeout={total_timeout}s)...", flush=True)

            if self.ws_broadcast:
                await self.ws_broadcast({
                    "type": "agent_attempt",
                    "agent": agent,
                    "attempt": attempt,
                    "max_retries": max_retries,
                    "timeout": total_timeout,
                })

            t0 = time.time()
            try:
                async with self.API_SEMAPHORE:
                    session_id = await self._ensure_session(agent)

                    async with self.client.stream(
                        "POST",
                        f"/session/{session_id}/message",
                        json={
                            "agent": agent,
                            "parts": [{"type": "text", "text": message}],
                            "stream": True,
                        },
                        timeout=httpx.Timeout(None, connect=60.0),
                    ) as resp:

                        if resp.status_code == 402:
                            err_msg = f"[LIMIT REACHED] [{agent}] PAYMENT/QUOTA REQUIRED (402) — server or model provider requires credits/billing refilled."
                            print(f"  {err_msg}", flush=True)
                            if self.ws_broadcast:
                                await self.ws_broadcast({"type": "opencode_limit_reached", "agent": agent, "status": 402, "message": err_msg})
                            raise OpencodeStuck(f"{agent} failed: payment/quota required (402)")
                        if resp.status_code == 403:
                            await resp.aread()
                            body = resp.text[:300]
                            err_msg = f"[LIMIT REACHED] [{agent}] FORBIDDEN (403) — API access or model limit restricted: {body}"
                            print(f"  {err_msg}", flush=True)
                            if self.ws_broadcast:
                                await self.ws_broadcast({"type": "opencode_limit_reached", "agent": agent, "status": 403, "message": err_msg})
                            raise OpencodeStuck(f"{agent} failed: forbidden (403)")
                        if resp.status_code in (413, 400):
                            await resp.aread()
                            body = resp.text[:300]
                            if any(k in body.lower() for k in ["context_length", "token_limit", "max_tokens", "rate_limit", "quota", "too_large"]):
                                err_msg = f"[LIMIT REACHED] [{agent}] CONTEXT/TOKEN LIMIT EXCEEDED ({resp.status_code}) — {body}"
                                print(f"  {err_msg}", flush=True)
                                if self.ws_broadcast:
                                    await self.ws_broadcast({"type": "opencode_limit_reached", "agent": agent, "status": resp.status_code, "message": err_msg})
                                raise OpencodeStuck(f"{agent} failed: token/context limit ({resp.status_code})")
                        if resp.status_code == 429:
                            retry_after = int(resp.headers.get("Retry-After", "10"))
                            delay_msg = f"[LIMIT REACHED] [{agent}] RATE LIMIT EXCEEDED (429) — waiting {retry_after}s for quota reset"
                            print(f"  {delay_msg}", flush=True)
                            if self.ws_broadcast:
                                await self.ws_broadcast({"type": "opencode_limit_reached", "agent": agent, "status": 429, "reason": delay_msg, "delay": retry_after})
                                await self.ws_broadcast({"type": "agent_retry", "agent": agent, "reason": delay_msg, "delay": retry_after})
                            await asyncio.sleep(retry_after)
                            continue
                        if resp.status_code == 503:
                            delay_msg = "server temporarily unavailable — waiting 5s"
                            print(f"  [{agent}] {delay_msg}", flush=True)
                            if self.ws_broadcast:
                                await self.ws_broadcast({"type": "agent_retry", "agent": agent, "reason": delay_msg, "delay": 5})
                            await asyncio.sleep(5)
                            continue
                        if resp.status_code >= 500:
                            await resp.aread()
                            err_msg = f"server error {resp.status_code}: {resp.text[:300]}"
                            last_err = err_msg
                            print(f"  [{agent}] {err_msg}", flush=True)
                            if attempt < max_retries:
                                if self.ws_broadcast:
                                    await self.ws_broadcast({"type": "agent_retry", "agent": agent, "reason": err_msg, "delay": retry_delay})
                                await asyncio.sleep(retry_delay)
                            continue

                        resp.raise_for_status()

                        full_text = ""
                        content_type = resp.headers.get("content-type", "")
                        parsed_body = None
                        
                        if "event-stream" in content_type:
                            async for line in resp.aiter_lines():
                                if not line.strip(): continue
                                if line.startswith("data: "):
                                    data_str = line[6:].strip()
                                    if data_str == "[DONE]": break
                                    try:
                                        chunk = json.loads(data_str)
                                        text = _extract_text(chunk)
                                        if text:
                                            full_text += text
                                            if self.ws_broadcast:
                                                await self.ws_broadcast({"type": "agent_stream", "agent": agent, "text": text})
                                    except Exception:
                                        pass
                        elif "application/x-ndjson" in content_type or "application/jsonlines" in content_type:
                            async for line in resp.aiter_lines():
                                if not line.strip(): continue
                                try:
                                    chunk = json.loads(line)
                                    text = _extract_text(chunk)
                                    if text:
                                        full_text += text
                                        if self.ws_broadcast:
                                            await self.ws_broadcast({"type": "agent_stream", "agent": agent, "text": text})
                                except Exception:
                                    pass
                        else:
                            await resp.aread()
                            try:
                                parsed_body = resp.json()
                                full_text = _extract_text(parsed_body)
                            except Exception:
                                parsed_body = None

                        if not full_text.strip() and session_id:
                            try:
                                msg_resp = await self.client.get(f"/session/{session_id}/message", timeout=15)
                                if msg_resp.status_code == 200:
                                    msgs = msg_resp.json()
                                    full_text = _extract_text(msgs)
                            except Exception as fetch_err:
                                print(f"  [{agent}] fallback message fetch warning: {fetch_err}", flush=True)

                        if not full_text.strip():
                            data = parsed_body if parsed_body is not None else {}
                            info = data.get("info", {}) if isinstance(data, dict) else {}
                            err = info.get("error")
                            if err:
                                print(f"  [{agent}] agent returned error: {err}", flush=True)
                                raise OpencodeStuck(f"{agent} error: {err}")
                            print(f"  [{agent}] EMPTY RESPONSE — raw keys: {list(data.keys()) if isinstance(data, dict) else type(data)}", flush=True)
                            first_part = (data.get("parts") or [None])[0] if isinstance(data, dict) else None
                            if first_part:
                                print(f"  [{agent}] first part: {json.dumps(first_part, indent=2)[:500]}", flush=True)
                            raise OpencodeStuck(f"{agent} returned empty response")

                    elapsed = time.time() - t0
                    self.timeout_tracker.record(agent, elapsed)

                    resp_len = len(full_text.strip())
                    print(f"  [{agent}] finished (elapsed={elapsed:.0f}s, chars={resp_len})", flush=True)
                    if self.ws_broadcast:
                        await self.ws_broadcast({
                            "type": "agent_done",
                            "agent": agent,
                            "elapsed": round(elapsed, 1),
                            "chars": resp_len,
                        })
                    return full_text or "(no text response)"

            except httpx.TimeoutException as e:
                last_err = f"{type(e).__name__}: {e}"
                timeout_msg = f"timed out or disconnected ({type(e).__name__}: {e})"
                print(f"  [{agent}] {timeout_msg} — attempt {attempt}/{max_retries}", flush=True)
                if attempt < max_retries:
                    if self.ws_broadcast:
                        await self.ws_broadcast({"type": "agent_retry", "agent": agent, "reason": timeout_msg, "delay": retry_delay})
                    await asyncio.sleep(retry_delay)
            except httpx.HTTPStatusError as e:
                last_err = e
                http_msg = f"HTTP {e.response.status_code}: {e.response.text[:200]}"
                print(f"  [{agent}] {http_msg}", flush=True)
                if attempt < max_retries:
                    if self.ws_broadcast:
                        await self.ws_broadcast({"type": "agent_retry", "agent": agent, "reason": http_msg, "delay": retry_delay})
                    await asyncio.sleep(retry_delay)
            except OpencodeStuck:
                if self.ws_broadcast:
                    await self.ws_broadcast({"type": "agent_failed", "agent": agent, "reason": str(last_err or "stuck")})
                raise
            except Exception as e:
                last_err = e
                err_msg = f"error: {e}"
                print(f"  [{agent}] {err_msg} — attempt {attempt}/{max_retries}", flush=True)
                if attempt < max_retries:
                    if self.ws_broadcast:
                        await self.ws_broadcast({"type": "agent_retry", "agent": agent, "reason": err_msg, "delay": retry_delay})
                    await asyncio.sleep(retry_delay)

        err_msg = f"{agent} failed after {max_retries} attempts. Last error: {last_err}"
        if self.ws_broadcast:
            await self.ws_broadcast({"type": "agent_failed", "agent": agent, "reason": str(last_err or "exhausted retries")})
        raise OpencodeStuck(err_msg)

    async def run_agent(self, agent: str, message: str, line_timeout: int | None = None, skip_fast_check: bool = True) -> str:
        return await self._run_one(agent, message, line_timeout, skip_fast_check=skip_fast_check)

    async def run_agents_parallel(self, agents_messages: list[tuple[str, str]], line_timeout: int | None = None) -> list[str]:
        self._current_session_id = None
        self._current_agent = None
        tasks = [self._run_one(agent, msg, line_timeout) for agent, msg in agents_messages]
        return await asyncio.gather(*tasks)

    async def tell(self, message: str, agent: str = "orchestrator") -> None:
        """Broadcast an informational message to WebSocket clients (non-blocking)."""
        if self.ws_broadcast:
            try:
                await self.ws_broadcast({
                    "type": "tell",
                    "agent": agent,
                    "message": message,
                })
            except Exception:
                pass

    async def stop(self):
        if self._current_session_id is not None:
            await self._delete_session(self._current_session_id)
            self._current_session_id = None
            self._current_agent = None
        if self.client:
            try:
                await self.client.aclose()
            except Exception:
                pass
        for t in getattr(self, "_drain_tasks", []):
            t.cancel()
        if self.process:
            try:
                if hasattr(self.process, "_transport") and self.process._transport:
                    try:
                        self.process._transport.close()
                    except Exception:
                        pass
                self.process.terminate()
                await asyncio.wait_for(self.process.wait(), timeout=3.0)
            except Exception:
                try:
                    self.process.kill()
                except Exception:
                    pass
            self.process = None
