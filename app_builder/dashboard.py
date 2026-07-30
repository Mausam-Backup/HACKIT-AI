import asyncio
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Optional

from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

APP_BUILDER_DIR = Path(__file__).parent
PROJECTS_DIR = APP_BUILDER_DIR / "projects"
DASHBOARD_PORT = 4097

build_process: Optional[subprocess.Popen] = None
build_slug: Optional[str] = None
ws_clients: list[WebSocket] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_watch_runs())
    yield
    task.cancel()


app = FastAPI(title="Hackathon Project Coach", lifespan=lifespan)

static_dir = APP_BUILDER_DIR / "static"
if static_dir.is_dir():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.middleware("http")
async def add_security_headers(request, call_next):
    resp = await call_next(request)
    if request.url.path.startswith("/static/"):
        return resp
    resp.headers["Content-Security-Policy"] = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'"
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    return resp


# --- API Routes ---

@app.get("/")
async def index():
    html = _get_html()
    return HTMLResponse(html)


@app.get("/api/projects")
async def list_projects():
    entries = []
    if PROJECTS_DIR.is_dir():
        for d in sorted(PROJECTS_DIR.iterdir()):
            if d.is_dir():
                info = _read_project_info(d)
                entries.append(info)
    return entries


@app.get("/api/projects/{slug}")
async def project_detail(slug: str):
    pdir = PROJECTS_DIR / slug
    if not pdir.is_dir():
        return JSONResponse({"error": "not found"}, status_code=404)
    return _read_project_info(pdir)


@app.get("/api/projects/{slug}/runs")
async def list_runs(slug: str):
    runs_dir = PROJECTS_DIR / slug / "runs"
    if not runs_dir.is_dir():
        return []
    files = []
    for f in sorted(runs_dir.iterdir()):
        if f.suffix == ".txt" and not f.name.endswith(".tmp"):
            files.append({
                "name": f.name,
                "size": f.stat().st_size,
                "mtime": f.stat().st_mtime,
            })
    return files


MAX_LOG_BYTES = 1024 * 1024


@app.get("/api/projects/{slug}/runs/{filename:path}")
async def read_run(slug: str, filename: str):
    if filename.endswith(".tmp"):
        return JSONResponse({"error": "not allowed"}, status_code=403)
    fpath = PROJECTS_DIR / slug / "runs" / filename
    if not fpath.is_file():
        return JSONResponse({"error": "not found"}, status_code=404)
    content = fpath.read_text(encoding="utf-8", errors="replace")
    if len(content) > MAX_LOG_BYTES:
        content = content[:MAX_LOG_BYTES] + f"\n\n... (truncated at {MAX_LOG_BYTES // 1024} KB)"
    return {"name": filename, "content": content}


@app.get("/api/projects/{slug}/tree")
async def file_tree(slug: str):
    pdir = PROJECTS_DIR / slug
    if not pdir.is_dir():
        return JSONResponse({"error": "not found"}, status_code=404)
    return _build_tree(pdir, pdir)


@app.get("/api/projects/{slug}/file")
async def read_file(slug: str, path: str):
    pdir = PROJECTS_DIR / slug
    if not pdir.is_dir():
        return JSONResponse({"error": "not found"}, status_code=404)
    fpath = (pdir / path).resolve()
    if not fpath.is_relative_to(pdir.resolve()):
        return JSONResponse({"error": "path traversal denied"}, status_code=403)
    if not fpath.is_file():
        return JSONResponse({"error": "not found"}, status_code=404)
    content = fpath.read_text(encoding="utf-8", errors="replace")
    if len(content) > MAX_LOG_BYTES:
        content = content[:MAX_LOG_BYTES] + f"\n\n... (truncated at {MAX_LOG_BYTES // 1024} KB)"
    return {"path": path, "content": content}


@app.get("/api/projects/{slug}/plan")
async def read_plan(slug: str):
    """Return the coach's plan documents for a project."""
    pdir = PROJECTS_DIR / slug
    if not pdir.is_dir():
        return JSONResponse({"error": "not found"}, status_code=404)
    docs = {}
    for doc_name in ["PLAN.md", "README.md", "ARCHITECTURE.md", "WALKTHROUGH.md", "NEXT-STEPS.md", "TASKS.md", "HACKATHON.md"]:
        fpath = pdir / doc_name
        if fpath.is_file():
            docs[doc_name] = fpath.read_text(encoding="utf-8", errors="replace")
    return docs


# --- Coach & Build Endpoints ---

@app.get("/api/coach/status")
async def coach_status():
    global build_process, build_slug
    if build_process is None:
        return {"running": False}
    ret = build_process.poll()
    if ret is not None:
        build_process = None
        return {"running": False, "exit_code": ret, "slug": build_slug}
    return {"running": True, "slug": build_slug}


class CoachReq(BaseModel):
    task: str


@app.post("/api/coach/start")
async def start_coach(req: CoachReq):
    global build_process, build_slug
    if build_process is not None and build_process.poll() is None:
        return JSONResponse({"error": "a build is already running"}, status_code=409)

    slug = _slugify(req.task)
    build_slug = slug
    build_process = subprocess.Popen(
        [sys.executable, str(APP_BUILDER_DIR / "orchestrator.py"),
         req.task, "--mode", "coach"],
        cwd=APP_BUILDER_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    async def _safe_stream():
        try:
            await _stream_build_output()
        except Exception as e:
            await _broadcast({"type": "build_output", "line": f"[stream error] {e}"})

    asyncio.create_task(_safe_stream())
    return {"started": True, "slug": slug}


class BuildReq(BaseModel):
    slug: str
    task: str = ""


@app.post("/api/build/start")
async def start_build(req: BuildReq):
    global build_process, build_slug
    if build_process is not None and build_process.poll() is None:
        return JSONResponse({"error": "a build is already running"}, status_code=409)

    slug = req.slug
    build_slug = slug
    task = req.task or slug.replace("-", " ")

    build_process = subprocess.Popen(
        [sys.executable, str(APP_BUILDER_DIR / "orchestrator.py"),
         task, "--mode", "build", "--slug", slug],
        cwd=APP_BUILDER_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    async def _safe_stream():
        try:
            await _stream_build_output()
        except Exception as e:
            await _broadcast({"type": "build_output", "line": f"[stream error] {e}"})

    asyncio.create_task(_safe_stream())
    return {"started": True, "slug": slug}


@app.post("/api/build/stop")
async def stop_build():
    global build_process
    if build_process is None or build_process.poll() is not None:
        return {"stopped": False, "reason": "no running build"}
    build_process.terminate()
    try:
        build_process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        build_process.kill()
    build_process = None
    await _broadcast({"type": "build_stopped"})
    return {"stopped": True}


# --- File access for plan docs ---

@app.get("/api/projects/{slug}/doc/{doc_name}")
async def read_doc(slug: str, doc_name: str):
    pdir = PROJECTS_DIR / slug
    if not pdir.is_dir():
        return JSONResponse({"error": "not found"}, status_code=404)
    allowed = {"PLAN.md", "README.md", "ARCHITECTURE.md", "WALKTHROUGH.md", "NEXT-STEPS.md", "HACKATHON.md", "JUDGE_SCORE.md", "TASKS.md"}
    if doc_name not in allowed:
        return JSONResponse({"error": "not allowed"}, status_code=403)
    fpath = (pdir / doc_name).resolve()
    if not fpath.is_relative_to(pdir.resolve()):
        return JSONResponse({"error": "path traversal denied"}, status_code=403)
    if not fpath.is_file():
        return JSONResponse({"error": "not found"}, status_code=404)
    content = fpath.read_text(encoding="utf-8", errors="replace")
    return {"name": doc_name, "content": content}


@app.get("/api/projects/{slug}/state")
async def project_state(slug: str):
    """Return structured project state for progress display."""
    pdir = PROJECTS_DIR / slug
    if not pdir.is_dir():
        return JSONResponse({"error": "not found"}, status_code=404)
    state_path = pdir / "project_state.json"
    if not state_path.is_file():
        return {}
    try:
        content = state_path.read_text(encoding="utf-8")
        return json.loads(content)
    except Exception:
        return {}


# --- WebSocket ---

@app.websocket("/ws")
async def websocket(ws: WebSocket):
    await ws.accept()
    ws_clients.append(ws)
    try:
        while True:
            data = await ws.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "ping":
                await ws.send_json({"type": "pong"})
            elif msg.get("type") == "subscribe_logs":
                from structured_log import get_logger
                entries = get_logger().get_recent(50)
                await ws.send_json({"type": "log_history", "entries": entries})
    except WebSocketDisconnect:
        ws_clients.remove(ws)


# --- Internal ---

async def _broadcast(data: dict):
    dead = []
    for ws in ws_clients:
        try:
            await ws.send_json(data)
        except Exception:
            dead.append(ws)
    for ws in dead:
        ws_clients.remove(ws)


_last_mtimes: dict[str, float] = {}


async def _watch_runs():
    while True:
        if PROJECTS_DIR.is_dir():
            for pdir in PROJECTS_DIR.iterdir():
                if not pdir.is_dir():
                    continue
                runs_dir = pdir / "runs"
                if not runs_dir.is_dir():
                    continue
                for f in runs_dir.iterdir():
                    if f.suffix != ".txt" or f.name.endswith(".tmp"):
                        continue
                    key = f"{pdir.name}/{f.name}"
                    mtime = f.stat().st_mtime
                    prev = _last_mtimes.get(key)
                    if prev is None:
                        _last_mtimes[key] = mtime
                        if mtime < time.time() - 300:
                            continue
                        content = f.read_text(encoding="utf-8", errors="replace")
                        await _broadcast({
                            "type": "log",
                            "slug": pdir.name,
                            "file": f.name,
                            "content": content[:2000],
                        })
                    elif mtime > prev:
                        _last_mtimes[key] = mtime
                        content = f.read_text(encoding="utf-8", errors="replace")
                        await _broadcast({
                            "type": "log_update",
                            "slug": pdir.name,
                            "file": f.name,
                            "content": content[:2000],
                        })
        await asyncio.sleep(2)


async def _stream_build_output():
    global build_process, build_slug
    if build_process is None or build_process.stdout is None:
        return
    loop = asyncio.get_event_loop()
    queue = asyncio.Queue()
    done = object()

    def _reader():
        try:
            for raw in iter(build_process.stdout.readline, ""):
                queue.put_nowait(raw)
        except Exception:
            pass
        finally:
            queue.put_nowait(done)

    reader_task = loop.run_in_executor(None, _reader)
    try:
        while True:
            item = await queue.get()
            if item is done:
                break
            line = item.rstrip()
            if line:
                await _broadcast({"type": "build_output", "line": line})
    except Exception:
        pass
    finally:
        build_process = None
        await reader_task
        await _broadcast({"type": "build_stopped", "slug": build_slug})


def _read_project_info(pdir) -> dict:
    pdir = Path(pdir)
    slug = pdir.name

    has_plan = (pdir / "PLAN.md").is_file()
    has_readme = (pdir / "README.md").is_file()
    has_architecture = (pdir / "ARCHITECTURE.md").is_file()
    has_walkthrough = (pdir / "WALKTHROUGH.md").is_file()
    has_prompts = (pdir / "NEXT-STEPS.md").is_file()
    has_tasks = (pdir / "TASKS.md").is_file()
    has_hackathon = (pdir / "HACKATHON.md").is_file()
    has_judge = (pdir / "JUDGE_SCORE.md").is_file()
    has_frontend = (pdir / "frontend").is_dir()
    has_backend = (pdir / "backend").is_dir()

    has_plan_docs = has_plan or has_readme or has_architecture or has_walkthrough or has_prompts or has_tasks or has_hackathon
    has_code = has_frontend or has_backend

    # Check validation status
    val_path = pdir / "runs" / "validation-result.json"
    validation_passed = False
    if val_path.is_file():
        try:
            val_data = json.loads(val_path.read_text())
            validation_passed = val_data.get("passed", False)
        except Exception:
            pass

    # Read progress from state
    progress_pct = 0
    state_path = pdir / "project_state.json"
    state_status = "new"
    if state_path.is_file():
        try:
            state_data = json.loads(state_path.read_text())
            progress_pct = state_data.get("progress_pct", 0)
            state_status = state_data.get("status", "new")
        except Exception:
            pass

    return {
        "slug": slug,
        "name": slug.replace("-", " ").title(),
        "path": str(pdir),
        "has_plan": has_plan_docs,
        "has_frontend": has_frontend,
        "has_backend": has_backend,
        "has_code": has_code,
        "has_judge": has_judge,
        "has_tasks": has_tasks,
        "validation_passed": validation_passed,
        "progress_pct": progress_pct,
        "state_status": state_status,
        "phase": "done" if (has_code and validation_passed and has_judge) else
                 "validated" if (has_code and validation_passed) else
                 "built" if has_code else
                 "planned" if has_plan_docs else
                 "new",
    }


def _build_tree(root, base) -> list:
    root = Path(root)
    base = Path(base)
    entries = []
    try:
        for child in sorted(root.iterdir()):
            name = child.name
            if name == "node_modules" or name == "__pycache__" or name.startswith("."):
                continue
            rel = str(child.relative_to(base)).replace("\\", "/")
            if child.is_dir():
                sub = _build_tree(child, base)
                entries.append({"name": name, "type": "dir", "path": rel, "children": sub})
            else:
                size = child.stat().st_size
                entries.append({"name": name, "type": "file", "path": rel, "size": size})
    except PermissionError:
        pass
    return entries


def _slugify(text: str) -> str:
    import hashlib
    import re
    h = hashlib.md5(text.encode()).hexdigest()[:8]
    clean = text.lower().strip()
    clean = re.sub(r"[^a-z0-9\s-]", "", clean)
    clean = re.sub(r"[\s-]+", "-", clean)
    return f"{clean[:52]}-{h}"


def _get_html() -> str:
    html_path = Path(static_dir) / "index.html"
    if html_path.is_file():
        return html_path.read_text(encoding="utf-8")
    return "<html><body><h1>Dashboard</h1><p>static/index.html not found</p></body></html>"


def main():
    from terminal_safe import SafeTerminalContext
    with SafeTerminalContext():
        import uvicorn
        port = int(os.environ.get("DASHBOARD_PORT", DASHBOARD_PORT))
        uvicorn.run(app, host="127.0.0.1", port=port)


if __name__ == "__main__":
    main()
