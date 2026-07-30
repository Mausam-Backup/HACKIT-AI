import json
import os
import time
from typing import Any


LOG_LEVELS = ["DEBUG", "INFO", "WARNING", "ERROR"]


class StructuredLogger:
    def __init__(self, log_dir: str | None = None, log_file: str = "pipeline.log"):
        self.log_dir = log_dir
        self.log_file = log_file
        self._entries: list[dict] = []

    def set_log_dir(self, log_dir: str):
        self.log_dir = log_dir

    def log(self, event: str, *, level: str = "INFO", iteration: Any = None,
            agent: str | None = None, stage: str | None = None,
            message: str | None = None, metadata: dict | None = None,
            **kwargs: Any):
        entry = {
            "timestamp": time.time(),
            "event": event,
            "level": level if level in LOG_LEVELS else "INFO",
        }
        if iteration is not None:
            entry["iteration"] = iteration
        if agent:
            entry["agent"] = agent
        if stage:
            entry["stage"] = stage
        if message:
            entry["message"] = message
        if metadata:
            entry["metadata"] = metadata
        entry.update(kwargs)
        self._entries.append(entry)
        if self.log_dir:
            self._write_entry(entry)

    def _write_entry(self, entry: dict):
        try:
            fpath = os.path.join(self.log_dir, self.log_file)
            os.makedirs(os.path.dirname(fpath), exist_ok=True)
            with open(fpath, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry, default=str) + "\n")
        except Exception:
            pass

    def get_recent(self, n: int = 20) -> list[dict]:
        return self._entries[-n:]

    def get_all(self) -> list[dict]:
        return list(self._entries)


_global_logger = StructuredLogger()
_ws_callbacks: list[callable] = []


def get_logger() -> StructuredLogger:
    return _global_logger


def log_event(event: str, **kwargs: Any):
    _global_logger.log(event, **kwargs)
    for cb in _ws_callbacks:
        try:
            cb(event, **kwargs)
        except Exception:
            pass


def register_ws_callback(cb: callable):
    _ws_callbacks.append(cb)
