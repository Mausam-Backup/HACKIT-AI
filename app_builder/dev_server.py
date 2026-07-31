import asyncio
import json
import os
import re
import socket
import subprocess
import sys

import httpx

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

from terminal_safe import graceful_terminate


class ProcessRegistry:
    _processes: dict[int, dict] = {}

    @classmethod
    def register(cls, pid: int, name: str = "unknown", port: int | None = None):
        cls._processes[pid] = {"name": name, "port": port, "pid": pid}

    @classmethod
    def unregister(cls, pid: int):
        cls._processes.pop(pid, None)

    @classmethod
    def cleanup_all(cls):
        from terminal_safe import graceful_terminate
        for pid, info in list(cls._processes.items()):
            try:
                proc = psutil.Process(pid)
                graceful_terminate(proc, timeout=3.0)
            except Exception:
                pass
        cls._processes.clear()


def _can_bind(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind(("127.0.0.1", port))
            return True
        except OSError:
            return False


def _find_free_port(start: int = 5173, end: int = 5199) -> int:
    for port in range(start, end + 1):
        if _can_bind(port):
            return port
    raise RuntimeError("No free port found in range 5173-5199")


def _get_process_on_port(port: int) -> list:
    processes = []
    if HAS_PSUTIL:
        try:
            for conn in psutil.net_connections():
                if conn.laddr and conn.laddr.port == port and conn.pid:
                    try:
                        processes.append(psutil.Process(conn.pid))
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        pass
        except Exception:
            pass
    return processes


def _is_dev_process(pid: int) -> bool:
    """Check if a process is likely a dev server (node/npm/python) before killing."""
    try:
        proc = psutil.Process(pid)
        name = proc.name().lower()
        cmd = " ".join(proc.cmdline()).lower() if proc.cmdline() else ""
        return any(t in name or t in cmd for t in ("node", "npm ", "python", "uvicorn"))
    except Exception:
        return True  # if we can't check, proceed anyway


def _kill_port_process(port: int):
    """Kill any dev process listening on the given port using psutil, with a subprocess fallback."""
    killed_any = False
    procs = _get_process_on_port(port)
    if procs:
        for proc in procs:
            if not _is_dev_process(proc.pid):
                continue
            try:
                proc.terminate()
                try:
                    proc.wait(timeout=3)
                    killed_any = True
                except Exception:
                    proc.kill()
                    killed_any = True
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
    
    if killed_any:
        return

    # Fallback to subprocess method
    try:
        if sys.platform == "win32":
            r = subprocess.run(
                ["netstat", "-ano", "-p", "TCP"],
                capture_output=True, text=True, timeout=5,
            )
            for line in r.stdout.splitlines():
                if f":{port}" in line and "LISTENING" in line:
                    parts = line.strip().split()
                    if parts:
                        pid_str = parts[-1]
                        try:
                            pid = int(pid_str)
                        except ValueError:
                            continue
                        if not _is_dev_process(pid):
                            continue
                        try:
                            subprocess.run(
                                ["taskkill", "/F", "/PID", pid_str],
                                capture_output=True, timeout=3,
                            )
                        except Exception:
                            pass
        else:
            pid_out = subprocess.run(
                ["lsof", "-ti", f":{port}"],
                capture_output=True, text=True, timeout=5,
            ).stdout.strip()
            if pid_out:
                for p in pid_out.split():
                    try:
                        pid = int(p)
                    except ValueError:
                        continue
                    if not _is_dev_process(pid):
                        continue
                    try:
                        subprocess.run(["kill", "-15", p], capture_output=True, timeout=3)
                    except Exception:
                        try:
                            subprocess.run(["kill", "-9", p], capture_output=True, timeout=3)
                        except Exception:
                            pass
    except Exception:
        pass


# Global npm cache dir to avoid re-downloading every iteration
NPM_CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".npm-cache")


async def _ensure_npm_cache():
    """Create a persistent npm cache directory shared across projects."""
    os.makedirs(NPM_CACHE_DIR, exist_ok=True)
    # Create .npmrc in the cache dir pointing to itself
    npmrc = os.path.join(NPM_CACHE_DIR, ".npmrc")
    if not os.path.exists(npmrc):
        with open(npmrc, "w") as f:
            f.write("cache=/dev/null\n")  # Use OS default cache; we use --cache flag instead


def _npm_install_cmd(project_dir: str) -> list[str]:
    """Build npm install command with persistent cache."""
    npm_exe = "npm.cmd" if sys.platform == "win32" else "npm"
    cmd = [npm_exe, "install", "--prefer-offline", "--no-audit", "--no-fund"]
    if os.path.isdir(NPM_CACHE_DIR):
        cmd.extend(["--cache", NPM_CACHE_DIR])
    return cmd


def _get_package_json_hash(project_dir: str) -> str:
    import hashlib
    hasher = hashlib.md5()
    paths = [
        os.path.join(project_dir, "package.json"),
        os.path.join(project_dir, "frontend", "package.json"),
        os.path.join(project_dir, "backend", "package.json"),
    ]
    for path in sorted(paths):
        if os.path.exists(path):
            hasher.update(path.encode())
            with open(path, "rb") as f:
                hasher.update(f.read())
    return hasher.hexdigest()


class DevServer:
    def __init__(self, project_dir: str):
        self.project_dir = project_dir
        self.process = None
        self.url = None
        self.build_ok = False
        self.build_log = ""
        self._reader_task = None
        self._port_event = asyncio.Event()
        self._port = None

    async def __aenter__(self):
        await self._install()
        self.build_ok, self.build_log = await self._build()
        if self.build_ok:
            cmd = await self._detect_serve_command()
            if cmd:
                await self._start_serve(cmd)
        return self

    async def __aexit__(self, *args):
        await self._stop()

    async def _install(self):
        # Speed optimization: check if package.json files have changed since last install
        hash_file = os.path.join(self.project_dir, ".hackit_install_hash")
        node_modules_exist = (
            os.path.isdir(os.path.join(self.project_dir, "node_modules")) or
            os.path.isdir(os.path.join(self.project_dir, "frontend", "node_modules")) or
            os.path.isdir(os.path.join(self.project_dir, "backend", "node_modules"))
        )
        current_hash = _get_package_json_hash(self.project_dir)
        
        if node_modules_exist and os.path.exists(hash_file):
            with open(hash_file, "r") as f:
                cached_hash = f.read().strip()
            if cached_hash == current_hash:
                # Skip npm install as dependencies haven't changed
                return

        cmd = _npm_install_cmd(self.project_dir)
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=self.project_dir,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            await asyncio.wait_for(proc.communicate(), timeout=120)
        except asyncio.TimeoutError:
            proc.kill()
            return

        with open(hash_file, "w") as f:
            f.write(current_hash)

    async def _build(self):
        proc = await asyncio.create_subprocess_shell(
            "npm run build",
            cwd=self.project_dir,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=300)
        except asyncio.TimeoutError:
            proc.kill()
            return False, "Build timed out after 300s"
        out = (stdout or b"").decode(errors="replace") + (stderr or b"").decode(errors="replace")
        ok = proc.returncode == 0
        if len(out) > 2000:
            out = "... (truncated) ...\n" + out[-2000:]
        return ok, out

    async def _detect_serve_command(self):
        pkg_path = os.path.join(self.project_dir, "package.json")
        if not os.path.exists(pkg_path):
            self.build_log = "No package.json found — skipping dev server"
            return None
        with open(pkg_path) as f:
            pkg = json.load(f)
        scripts = pkg.get("scripts", {})
        if "preview" in scripts:
            return "npm run preview"
        if "dev" in scripts:
            return "npm run dev"
        self.build_log = "No dev/preview script in package.json — skipping dev server"
        return None

    async def _start_serve(self, cmd: str):
        # Kill any existing process on common ports before starting
        for p in [3000, 3001, 4173, 5173, 5174, 5175, 8080, 9000, 5000]:
            _kill_port_process(p)

        self.process = await asyncio.create_subprocess_shell(
            cmd,
            cwd=self.project_dir,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )
        if self.process and self.process.pid:
            ProcessRegistry.register(self.process.pid, name="dev-server", port=self._port)
        self._reader_task = asyncio.create_task(self._read_output())

        try:
            await asyncio.wait_for(self._port_event.wait(), timeout=20)
        except asyncio.TimeoutError:
            self._port = await self._scan_ports()
            if not self._port:
                raise RuntimeError("Could not detect dev server port")

        self.url = f"http://127.0.0.1:{self._port}"
        await self._wait_healthy()

    async def _read_output(self):
        pattern = re.compile(r"https?://(?:127\.0\.0\.1|localhost|\[::1\]):(\d+)")
        while True:
            try:
                line = await self.process.stdout.readline()
            except Exception:
                break
            if not line:
                break
            decoded = line.decode(errors="replace")
            m = pattern.search(decoded)
            if m:
                self._port = int(m.group(1))
                self._port_event.set()

    async def _scan_ports(self):
        pkg_path = os.path.join(self.project_dir, "package.json")
        expected_name = ""
        if os.path.exists(pkg_path):
            try:
                with open(pkg_path) as f:
                    expected_name = json.load(f).get("name", "").lower()
            except Exception:
                pass

        fragments = set()
        if expected_name:
            raw = expected_name.replace("-", " ").replace("_", " ").strip()
            fragments.add(expected_name)
            fragments.add(raw)
            for part in raw.split():
                if len(part) > 3:
                    fragments.add(part)

        title_pattern = re.compile(r"<title\b[^>]*>([^<]+)</title>", re.IGNORECASE)

        for port in [3000, 4173, 5173, 8080, 9000, 5000, 3001, 5174, 5175]:
            async with httpx.AsyncClient() as c:
                try:
                    r = await c.get(f"http://127.0.0.1:{port}", timeout=2)
                    if r.status_code < 500:
                        if not expected_name:
                            return port
                        m = title_pattern.search(r.text)
                        title_text = m.group(1).lower() if m else r.text[:500].lower()
                        if any(frag in title_text for frag in fragments):
                            return port
                except Exception:
                    pass
        return None

    async def _wait_healthy(self):
        async with httpx.AsyncClient() as c:
            delay = 0.5
            for i in range(15):
                try:
                    r = await c.get(self.url, timeout=2)
                    if r.status_code < 500:
                        return
                except Exception:
                    pass
                await asyncio.sleep(delay)
                delay = min(delay * 1.5, 5.0)
            raise RuntimeError(f"Dev server at {self.url} not healthy")

    async def _stop(self):
        if self._reader_task:
            self._reader_task.cancel()
            self._reader_task = None
        if self.process:
            if self.process.pid:
                ProcessRegistry.unregister(self.process.pid)
            graceful_terminate(self.process, timeout=5.0)
            self.process = None
