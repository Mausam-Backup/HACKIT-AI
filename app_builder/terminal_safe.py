import atexit
import os
import signal
import subprocess
import sys
import warnings

# Suppress noisy Windows asyncio subprocess transport warnings on exit
warnings.filterwarnings("ignore", category=ResourceWarning)


class SafeTerminalContext:
    def __enter__(self):
        for stream in (sys.stdout, sys.stderr):
            if stream and hasattr(stream, "reconfigure"):
                try:
                    stream.reconfigure(encoding="utf-8", errors="replace")
                except Exception:
                    pass
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.restore()

    @staticmethod
    def restore():
        try:
            sys.stdout.write("\x1b[?1000l\x1b[?1002l\x1b[?1003l\x1b[?1006l")
            sys.stdout.flush()
        except Exception:
            pass


atexit.register(SafeTerminalContext.restore)
signal.signal(signal.SIGINT, lambda sig, frame: sys.exit(130))


def graceful_terminate(proc: subprocess.Popen | None, timeout: float = 5.0):
    if proc is None:
        return
    pid = proc.pid
    if pid is None:
        return

    if sys.platform == "win32":
        try:
            subprocess.run(
                ["taskkill", "/T", "/PID", str(pid)],
                capture_output=True, timeout=int(timeout),
            )
        except Exception:
            pass
    else:
        try:
            os.killpg(pid, signal.SIGTERM)
            proc.wait(timeout=timeout)
        except (AttributeError, ProcessLookupError, PermissionError, subprocess.TimeoutExpired):
            try:
                proc.terminate()
                proc.wait(timeout=timeout)
            except (Exception, subprocess.TimeoutExpired):
                try:
                    proc.kill()
                except Exception:
                    pass
