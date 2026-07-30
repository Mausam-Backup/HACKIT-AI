import os
import sys
import asyncio
import json
import traceback

for _stream in (sys.stdout, sys.stderr):
    if _stream and hasattr(_stream, "reconfigure"):
        try:
            _stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from structured_log import register_ws_callback, get_logger, log_event
from orchestrator import run_pipeline
from config import Config

DEBUG_LOG_FILE = os.path.abspath("pipeline_debug.log")

def emit_json(event, **kwargs):
    payload = {"event": event}
    payload.update(kwargs)
    print(json.dumps(payload), flush=True)

    try:
        with open(DEBUG_LOG_FILE, "a", encoding="utf-8") as f:
            msg = kwargs.get("message") or kwargs.get("error") or str(kwargs)
            f.write(f"[{event}] {msg}\n")
    except Exception:
        pass

async def main():
    from terminal_safe import SafeTerminalContext
    with SafeTerminalContext():
        os.environ["RUNNING_IN_TUI"] = "1"
        if len(sys.argv) < 2:
            emit_json("pipeline_error", error="No task provided")
            sys.exit(1)

        task_input = " ".join(sys.argv[1:])

        base_idea = task_input.split("[TECH STACK REQUIRED:")[0].strip()
        from scaffold import slugify
        clean_slug = slugify(base_idea)

        log_dir = os.path.abspath(os.path.join(".", clean_slug, "runs"))
        get_logger().set_log_dir(log_dir)

        register_ws_callback(emit_json)

        config = Config.from_yaml()
        try:
            log_event("pipeline_start", message=f"Starting pipeline for task: '{base_idea}' [slug: {clean_slug}]")
            result = await run_pipeline(task=task_input, config=config, mode="full", parent_dir=".", slug_override=clean_slug)
            if not result.get("success"):
                emit_json("pipeline_error", error="Pipeline completed with failures", result=result)
                sys.exit(1)
        except Exception as e:
            tb = traceback.format_exc()
            err_msg = f"{type(e).__name__}: {e}"
            log_event("pipeline_error", level="ERROR", error=err_msg, traceback=tb)

            try:
                with open(DEBUG_LOG_FILE, "a", encoding="utf-8") as f:
                    f.write(f"\n================ PIPELINE FATAL ERROR ================\n{tb}\n======================================================\n")
            except Exception:
                pass

            emit_json("pipeline_error", error=err_msg, traceback=tb, log_file=DEBUG_LOG_FILE)
            sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
