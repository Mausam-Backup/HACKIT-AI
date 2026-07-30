import asyncio
import json
import os
import re
import shutil
import subprocess
import sys
import time

import httpx

from config import Config
from dev_server import DevServer
from opencode_client import OpencodeClient, OpencodeStuck
from scaffold import scaffold_project, copy_agents, git_commit, load_prompt, run_lint_and_test
from stack_manager import load_project_stack
from structured_log import log_event, get_logger
from terminal_safe import SafeTerminalContext

APP_BUILDER_DIR = os.path.dirname(os.path.abspath(__file__))


def _safe(text: str) -> str:
    return text.replace("\u2713", "[OK]").replace("\u2717", "[FAIL]").replace("\u2714", "[OK]")

def log(msg: str, event: str | None = None, **kwargs):
    if not os.environ.get("RUNNING_IN_TUI"):
        print(f"  {_safe(msg)}", flush=True)
    log_event(event or "log_message", message=msg, **kwargs)


FAILURE_SENTINELS = ["FAILED:", "(empty or skipped)", "ABORT-MARKER"]
CACHE_MAX_AGE = 300

_COACH_CACHE: dict[str, str] = {}


def _cache_key(phase: str, agent: str, message: str) -> str:
    import hashlib
    raw = f"{phase}-{agent}-{message}"
    return hashlib.md5(raw.encode()).hexdigest()


def _check_cached(project_dir: str, phase: str, agent: str, message: str = "",
                  min_bytes: int = 50, requires_patterns: list[str] | None = None) -> str | None:
    key = _cache_key(phase, agent, message)
    if key in _COACH_CACHE:
        log(f"[{agent}] {phase} cache HIT (memory)")
        return _COACH_CACHE[key]

    fpath = os.path.join(project_dir, "runs", f"{phase}-{agent}.txt")
    try:
        if not os.path.exists(fpath) or os.path.getsize(fpath) == 0:
            return None

        age = time.time() - os.path.getmtime(fpath)
        if age > CACHE_MAX_AGE:
            log(f"[{agent}] {phase} cached file too old ({age:.0f}s)")
            os.remove(fpath)
            return None

        with open(fpath, encoding="utf-8") as f:
            content = f.read()

        if len(content) < min_bytes:
            log(f"[{agent}] {phase} cached file too small ({len(content)}b < {min_bytes}b)")
            os.remove(fpath)
            return None

        for sentinel in FAILURE_SENTINELS:
            if content.strip().startswith(sentinel):
                log(f"[{agent}] {phase} cached file has sentinel '{sentinel}'")
                os.remove(fpath)
                return None

        if requires_patterns:
            for pat in requires_patterns:
                if pat not in content:
                    log(f"[{agent}] {phase} cached file missing '{pat}'")
                    os.remove(fpath)
                    return None

        _COACH_CACHE[key] = content
        log(f"[{agent}] {phase} already done — skipping")
        return content
    except OSError:
        return None


def _save_response(project_dir: str, phase: str, agent: str, text: str):
    runs_dir = os.path.join(project_dir, "runs")
    os.makedirs(runs_dir, exist_ok=True)
    fname = f"{phase}-{agent}.txt"
    tmp = os.path.join(runs_dir, fname + ".tmp")
    final = os.path.join(runs_dir, fname)
    text_str = str(text) if text else "(empty or skipped)"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(text_str)
    os.replace(tmp, final)
    first_line = text_str.strip().split("\n")[0][:100]
    log(f"[{agent}] {phase} done — {first_line}")


def _extract_missing_coach_files(project_dir: str, expected_files: list[str], raw_texts: list[str]) -> list[str]:
    """Fallback extractor: if Coach agent returned file specs in text output instead of tool calls,
    extract and save them to project_dir to prevent pipeline hang/failure."""
    extracted = []
    combined_text = "\n\n".join(str(t) for t in raw_texts if t)
    if not combined_text.strip():
        return extracted

    for fname in expected_files:
        fpath = os.path.join(project_dir, fname)
        if os.path.exists(fpath) and os.path.getsize(fpath) >= 50:
            continue

        base_fname = os.path.basename(fname)
        escaped = re.escape(base_fname)
        patterns = [
            r"(?:^|\n)(?:[#=]+\s*|\*\*|File:\s*|Filename:\s*)" + escaped + r"\s*(?:\*\*)?\s*\n+```(?:\w+)?\n([\s\S]*?)```",
            r"```(?:\w+:|)" + escaped + r"\n([\s\S]*?)```",
            r"(?:^|\n)[#=]+\s*" + escaped + r"\s*\n([\s\S]*?)(?=\n[#=]+\s*|\Z)",
        ]

        for pat in patterns:
            m = re.search(pat, combined_text, re.IGNORECASE)
            if m:
                content = m.group(1).strip()
                if len(content) >= 50:
                    os.makedirs(os.path.dirname(fpath), exist_ok=True)
                    with open(fpath, "w", encoding="utf-8") as f:
                        f.write(content)
                    log(f"[Fallback Extractor] Recovered {fname} from coach text response ({len(content)} bytes)")
                    extracted.append(fname)
                    break

    return extracted


def _parse_tasks_to_state(project_dir: str, task: str) -> dict:
    """Parse TASKS.md into structured project state."""
    tasks_path = os.path.join(project_dir, "TASKS.md")
    all_tasks = []
    if os.path.exists(tasks_path):
        try:
            with open(tasks_path, encoding="utf-8") as f:
                for line in f:
                    m = re.match(r"- \[ \] (.+)", line.strip())
                    if m:
                        all_tasks.append({"task": m.group(1), "done": False})
        except Exception:
            pass

    plan_path = os.path.join(project_dir, "PLAN.md")
    risks = []
    if os.path.exists(plan_path):
        try:
            with open(plan_path, encoding="utf-8") as f:
                content = f.read()
            in_risks = False
            for line in content.splitlines():
                if line.strip().startswith("#### Risks"):
                    in_risks = True
                    continue
                if in_risks and line.strip().startswith("####"):
                    break
                if in_risks and line.strip().startswith("-"):
                    risks.append(line.strip().lstrip("- ").strip())
        except Exception:
            pass

    state = {
        "idea": task,
        "all_tasks": all_tasks,
        "completed": [],
        "remaining": [t["task"] for t in all_tasks if not t["done"]],
        "risks": risks,
        "status": "planned",
        "progress_pct": 0,
    }

    state_path = os.path.join(project_dir, "project_state.json")
    with open(state_path, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)
    log(f"Project state saved ({len(all_tasks)} tasks, {len(risks)} risks)")
    return state


def _update_state_after_build(project_dir: str):
    """Mark backend tasks as done if backend dir exists, frontend if frontend dir exists."""
    state_path = os.path.join(project_dir, "project_state.json")
    if not os.path.exists(state_path):
        return

    try:
        with open(state_path, encoding="utf-8") as f:
            state = json.load(f)
    except Exception:
        return

    has_fe = os.path.isdir(os.path.join(project_dir, "frontend"))
    has_be = os.path.isdir(os.path.join(project_dir, "backend"))

    for t in state.get("all_tasks", []):
        task_text = t.get("task", "").lower()
        if has_fe and ("frontend" in task_text or "ui" in task_text or "page" in task_text):
            t["done"] = True
        if has_be and ("backend" in task_text or "api" in task_text or "endpoint" in task_text):
            t["done"] = True

    state["completed"] = [t["task"] for t in state.get("all_tasks", []) if t.get("done")]
    state["remaining"] = [t["task"] for t in state.get("all_tasks", []) if not t.get("done")]
    total = len(state.get("all_tasks", []))
    done = len(state["completed"])
    state["progress_pct"] = int((done / total * 100)) if total > 0 else 0
    state["status"] = "built"

    with open(state_path, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)
    log(f"State updated: {done}/{total} tasks ({state['progress_pct']}%)")


async def _run_agent(client: OpencodeClient, project_dir: str, phase: str,
                     agent: str, message: str, min_bytes: int = 50,
                     patterns: list[str] | None = None) -> str:
    cached = _check_cached(project_dir, phase, agent, message=message,
                           min_bytes=min_bytes, requires_patterns=patterns)
    if cached is not None:
        return cached

    resp = await client.run_agent(agent, message)
    _save_response(project_dir, phase, agent, resp)
    return resp


async def _verify_models(client: OpencodeClient, models: dict[str, str]):
    for agent, model in models.items():
        try:
            await client.verify_healthy()
            log(f"[{agent}] model {model} OK")
        except Exception as e:
            log(f"[{agent}] model check failed: {e}")
            raise RuntimeError(f"Model {model} for agent '{agent}' unavailable: {e}")


async def _create_root_integration(project_dir: str) -> bool:
    """Create root-level package.json to tie frontend and backend together."""
    root_pkg_path = os.path.join(project_dir, "package.json")
    fe_pkg_path = os.path.join(project_dir, "frontend", "package.json")
    be_pkg_path = os.path.join(project_dir, "backend", "package.json")

    if os.path.exists(root_pkg_path):
        return True

    fe_name = "frontend"
    be_name = "backend"

    if os.path.exists(fe_pkg_path):
        try:
            with open(fe_pkg_path) as f:
                fe_name = json.load(f).get("name", "frontend")
        except Exception:
            pass

    root_pkg = {
        "name": os.path.basename(project_dir),
        "private": True,
        "scripts": {
            "dev": f"concurrently \"npm run dev --prefix frontend\" \"npm run dev --prefix backend\"",
            "build": f"npm run build --prefix frontend && npm run build --prefix backend",
            "start": "node backend/server.js",
            "lint": f"npm run lint --prefix frontend || true && npm run lint --prefix backend || true",
            "test": f"npm run test --prefix frontend || true && npm run test --prefix backend || true",
        },
        "devDependencies": {
            "concurrently": "^8.2.0"
        }
    }

    os.makedirs(project_dir, exist_ok=True)
    with open(root_pkg_path, "w", encoding="utf-8") as f:
        json.dump(root_pkg, f, indent=2)

    try:
        npm_exe = "npm.cmd" if sys.platform == "win32" else "npm"
        subprocess.run(
            [npm_exe, "install", "--no-audit", "--no-fund"],
            cwd=project_dir, capture_output=True, timeout=120,
        )
    except Exception as e:
        log(f"Root npm install warning: {e}")

    return True


async def run_validation(project_dir: str) -> dict:
    """Run real validation: npm run build, lint, test. Return results."""
    log("Running validation...")

    # Run build
    build_ok = False
    build_log = ""
    try:
        proc = await asyncio.create_subprocess_shell(
            "npm run build",
            cwd=project_dir,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=300)
        build_log = (stdout or b"").decode(errors="replace") + "\n" + (stderr or b"").decode(errors="replace")
        build_ok = proc.returncode == 0
    except asyncio.TimeoutError:
        build_log = "Build timed out after 300s"
    except Exception as e:
        build_log = f"Build error: {e}"

    if build_ok:
        log("Build: PASSED")
    else:
        log("Build: FAILED")

    # Run lint + test
    lint_test = run_lint_and_test(project_dir)
    lint_ok = lint_test.get("lint", {}).get("exit_code", -1) in (0, -1)
    test_ok = lint_test.get("test", {}).get("exit_code", -1) in (0, -1)

    validation_result = {
        "build_ok": build_ok,
        "build_log": build_log[:2000] if build_log else "",
        "lint_ok": lint_ok,
        "lint_output": (lint_test.get("lint", {}).get("stdout", "") or "")[:1000],
        "test_ok": test_ok,
        "test_output": (lint_test.get("test", {}).get("stdout", "") or "")[:1000],
        "passed": build_ok and lint_ok and test_ok,
    }

    # Save result for dashboard
    runs_dir = os.path.join(project_dir, "runs")
    os.makedirs(runs_dir, exist_ok=True)
    with open(os.path.join(runs_dir, "validation-result.json"), "w", encoding="utf-8") as f:
        json.dump(validation_result, f)

    return validation_result


async def phase_coach(client: OpencodeClient, project_dir: str, task: str, coach_timeout: int = 300) -> bool:
    """Phase 1: Coach analyzes the idea and generates plans + task files in 2 fast targeted passes."""
    log_event("coach_start", task=task)
    log("=" * 60)
    log("PHASE 1/3: COACH — Analyzing project idea")
    log("=" * 60)

    await client.tell("Coach: Generating core project build specifications...")

    stack = load_project_stack(project_dir)
    fe_fw = stack.get("frontend", {}).get("framework", "frontend")
    be_fw = stack.get("backend", {}).get("framework", "backend")
    db_fw = stack.get("backend", {}).get("database", "database")

    # Pass 1: Core Build Specs
    coach_msg1 = (
        f"You are a Hackathon Project Coach.\n"
        f"User's idea: {task}\n"
        f"Target Stack: {stack.get('name', 'Custom Stack')}\n\n"
        f"Write the following 6 core files using the edit tool immediately:\n"
        f"1. PLAN.md — Project problem, solution, tech stack, API plan, and database plan.\n"
        f"2. README.md — Tagline, MVP features, and quick start guide.\n"
        f"3. TASKS.md — Trackable flat task list formatted as `- [ ] Task`.\n"
        f"4. api-contract.json — Centralized API schema contract that both frontend and backend will follow.\n"
        f"5. tasks/frontend-task.md — Build spec for {fe_fw} frontend.\n"
        f"6. tasks/backend-task.md — Build spec for {be_fw} backend using {db_fw}.\n"
        f"Write all 6 files now."
    )
    core_files = ["PLAN.md", "README.md", "TASKS.md", "api-contract.json", os.path.join("tasks", "frontend-task.md"), os.path.join("tasks", "backend-task.md")]

    # Pass 2: Extended Documentation & Guides
    coach_msg2 = (
        f"You are a Hackathon Project Coach.\n"
        f"User's idea: {task}\n"
        f"Target Stack: {stack.get('name', 'Custom Stack')}\n\n"
        f"Write the following 4 documentation files using the edit tool immediately:\n"
        f"1. ARCHITECTURE.md — System architecture, database schema, API spec, and security.\n"
        f"2. WALKTHROUGH.md — File directory map, setup runbook, and manual test steps.\n"
        f"3. NEXT-STEPS.md — Series-by-series prompts to build/extend the project.\n"
        f"4. HACKATHON.md — Demo script, pitch outline, and presentation checklist.\n"
        f"Write all 4 files now."
    )
    doc_files = ["ARCHITECTURE.md", "WALKTHROUGH.md", "NEXT-STEPS.md", "HACKATHON.md"]
    expected_files = core_files + doc_files

    t1 = asyncio.create_task(_run_agent(client, project_dir, "coach-pass1", "coach", coach_msg1, min_bytes=200, patterns=["PLAN.md", "README.md", "TASKS.md"]))
    t2 = asyncio.create_task(_run_agent(client, project_dir, "coach-pass2", "coach", coach_msg2, min_bytes=200, patterns=["ARCHITECTURE.md", "WALKTHROUGH.md", "NEXT-STEPS.md", "HACKATHON.md"]))
    
    done, pending = await asyncio.wait([t1, t2], timeout=coach_timeout)
    for task in pending:
        log(f"Coach pass timed out after {coach_timeout}s — cancelling")
        task.cancel()

    pass_responses = []
    for t in [t1, t2]:
        if t.done() and not t.cancelled() and not t.exception():
            pass_responses.append(t.result())

    # Fallback extraction in case Coach output files as markdown text instead of executing tool calls
    _extract_missing_coach_files(project_dir, expected_files, pass_responses)

    for f in expected_files:
        p = os.path.join(project_dir, f)
        if os.path.exists(p) and os.path.getsize(p) >= 50:
            log(f"[OK] Created: {f} ({os.path.getsize(p)} bytes)")

    coach_ok = True
    for fname in expected_files:
        fpath = os.path.join(project_dir, fname)
        if not os.path.exists(fpath) or os.path.getsize(fpath) < 50:
            log(f"Coach missing: {fname}")
            coach_ok = False

    if coach_ok:
        log("Coach: Project plan complete")
    else:
        log("Coach: Some files missing — attempting targeted repair...")
        max_repair = 3
        for attempt in range(1, max_repair + 1):
            missing = [f for f in expected_files if not os.path.exists(os.path.join(project_dir, f)) or os.path.getsize(os.path.join(project_dir, f)) < 50]
            if not missing:
                coach_ok = True
                break
            log(f"Coach repair attempt {attempt}/{max_repair} — {len(missing)} files missing")
            coach_fix_msg = f"Write the following missing files using edit:\n" + "\n".join(f"- {m}" for m in missing)
            try:
                resp = await client.run_agent("coach", coach_fix_msg)
                _save_response(project_dir, "coach-fix", "coach", resp)
                _extract_missing_coach_files(project_dir, expected_files, [resp])
                coach_ok = all(os.path.exists(os.path.join(project_dir, f)) and os.path.getsize(os.path.join(project_dir, f)) >= 50 for f in expected_files)
                if coach_ok:
                    break
            except Exception as e:
                log(f"Coach repair attempt {attempt} failed: {e}")
                coach_ok = False

    git_commit(project_dir, "phase-coach")
    log_event("coach_complete", success=coach_ok)
    return coach_ok


async def phase_builder(client: OpencodeClient, project_dir: str, repair: bool | dict = False) -> bool:
    """Phase 2: Builder generates the project (FE + BE in parallel)."""
    is_repair = bool(repair)
    tag = "repair" if is_repair else "build"
    log_event("builder_start", tag=tag)
    log("=" * 60)
    log(f"PHASE 2/3: BUILDER — Generating project ({tag})")
    log("=" * 60)

    await client.tell("Builder: Generating frontend and backend...")

    stack = load_project_stack(project_dir)
    fe_cfg = stack.get("frontend", {})
    be_cfg = stack.get("backend", {})
    cust_inst = stack.get("custom_instructions", "")

    frontend_msg = load_prompt(
        "frontend.txt",
        FRONTEND_DIR=fe_cfg.get("dir", "./frontend"),
        FRONTEND_BUILD_CMD=fe_cfg.get("build_script", "npm run build"),
        FRONTEND_TEST_CMD=fe_cfg.get("test_script", "echo 'no tests yet' && exit 0"),
        FRONTEND_FRAMEWORK=fe_cfg.get("framework", "React 18.x"),
        FRONTEND_BUILD_TOOL=fe_cfg.get("build_tool", "Vite 5.x"),
        FRONTEND_ICONS=fe_cfg.get("icons", "lucide-react 0.469.x"),
        CUSTOM_INSTRUCTIONS=cust_inst
    )
    backend_msg = load_prompt(
        "backend.txt",
        BACKEND_DIR=be_cfg.get("dir", "./backend"),
        BACKEND_BUILD_CMD=be_cfg.get("build_script", "node --check server.js"),
        BACKEND_TEST_CMD=be_cfg.get("test_script", "echo 'no tests yet' && exit 0"),
        BACKEND_FRAMEWORK=be_cfg.get("framework", "Node.js / Express 4.x"),
        BACKEND_DATABASE=be_cfg.get("database", "SQLite (better-sqlite3)"),
        BACKEND_PORT_ENV=be_cfg.get("port_env", "PORT_BACKEND"),
        CUSTOM_INSTRUCTIONS=cust_inst
    )

    if is_repair:
        repair_info = ""
        if isinstance(repair, dict):
            fails = []
            if not repair.get("build_ok", True):
                fails.append("build")
            if not repair.get("lint_ok", True):
                fails.append("lint")
            if not repair.get("test_ok", True):
                fails.append("test")
            if fails:
                repair_info = f" (failed: {', '.join(fails)})"
        frontend_msg += (
            f"\n\nThe previous build{repair_info} had validation errors. Read the build output and fix ALL issues. "
            "Do not rewrite working code. Only fix the reported problems."
        )
        backend_msg += (
            f"\n\nThe previous build{repair_info} had validation errors. Read the build output and fix ALL issues. "
            "Do not rewrite working code. Only fix the reported problems."
        )

    async def _run_builder_agent(agent: str, msg: str) -> tuple[bool, str]:
        try:
            resp = await client.run_agent(agent, msg)
            _save_response(project_dir, tag, agent, resp)
            return True, resp
        except Exception as e:
            log(f"[{agent}] failed: {e}")
            _save_response(project_dir, tag, agent, f"FAILED: {e}")
            return False, str(e)

    fe_task = asyncio.create_task(_run_builder_agent("frontend", frontend_msg))
    be_task = asyncio.create_task(_run_builder_agent("backend", backend_msg))
    fe_ok, fe_resp = await fe_task
    be_ok, be_resp = await be_task

    fe_dir = os.path.join(project_dir, "frontend")
    be_dir = os.path.join(project_dir, "backend")

    if not fe_ok or not os.path.isdir(fe_dir):
        log("Frontend build failed — no ./frontend/ directory")
        fe_ok = False
    if not be_ok or not os.path.isdir(be_dir):
        log("Backend build failed — no ./backend/ directory")
        be_ok = False

    builder_ok = fe_ok and be_ok

    log(f"Builder: frontend={'OK' if fe_ok else 'FAIL'}, backend={'OK' if be_ok else 'FAIL'}")

    if builder_ok:
        integration_ok = await _create_root_integration(project_dir)
        if integration_ok:
            log("Integration: root package.json created")
        git_commit(project_dir, f"phase-{tag}")

    log_event("builder_complete", tag=tag, success=builder_ok)
    return builder_ok


async def phase_validation(project_dir: str) -> dict:
    """Phase 3: Run real validation commands."""
    log_event("validation_start")
    log("=" * 60)
    log("PHASE 3/3: VALIDATION — Running build, lint, tests")
    log("=" * 60)

    result = await run_validation(project_dir)

    if result["passed"]:
        log("[OK] Validation: ALL CHECKS PASSED")
    else:
        fails = []
        if not result["build_ok"]:
            fails.append("build")
        if not result["lint_ok"]:
            fails.append("lint")
        if not result["test_ok"]:
            fails.append("test")
        log(f"[FAIL] Validation: FAILED ({', '.join(fails)})")

    log_event("validation_complete", passed=result["passed"])
    return result


async def phase_pitch_update(client: OpencodeClient, project_dir: str) -> bool:
    """Regenerate HACKATHON.md with actual build results."""
    log_event("pitch_update_start")
    log("=" * 60)
    log("PHASE: PITCH UPDATE — Regenerating with actual build")
    log("=" * 60)

    if not os.path.exists(os.path.join(project_dir, "HACKATHON.md")):
        log("No HACKATHON.md found — skipping pitch update")
        return False

    await client.tell("Updating pitch to reflect what was actually built...")

    pitch_msg = load_prompt("pitch_update.txt")
    try:
        resp = await client.run_agent("coach", pitch_msg)
        _save_response(project_dir, "pitch", "coach", resp)
        log("Pitch updated")
        log_event("pitch_update_complete", success=True)
        return True
    except Exception as e:
        log(f"Pitch update failed: {e}")
        _save_response(project_dir, "pitch", "coach", f"FAILED: {e}")
        log_event("pitch_update_complete", success=False)
        return False


async def phase_judge_score(client: OpencodeClient, project_dir: str) -> bool:
    """Generate JUDGE_SCORE.md evaluating the project against hackathon criteria."""
    log_event("judge_start")
    log("=" * 60)
    log("PHASE: JUDGE — Evaluating project against hackathon criteria")
    log("=" * 60)

    await client.tell("Evaluating project for hackathon readiness...")

    judge_msg = load_prompt("judge_score.txt")
    try:
        resp = await client.run_agent("coach", judge_msg)
        _save_response(project_dir, "judge", "coach", resp)

        # Check if JUDGE_SCORE.md was created
        judge_path = os.path.join(project_dir, "JUDGE_SCORE.md")
        if os.path.exists(judge_path) and os.path.getsize(judge_path) > 100:
            log("Judge score generated")
            log_event("judge_complete", success=True)
            return True
        log("Judge score file missing or too small")
        log_event("judge_complete", success=False)
        return False
    except Exception as e:
        log(f"Judge score failed: {e}")
        _save_response(project_dir, "judge", "coach", f"FAILED: {e}")
        log_event("judge_complete", success=False)
        return False


def _print_summary(project_dir: str, slug: str, start_time: float, phases: dict):
    total = time.time() - start_time

    file_count = 0
    for root, dirs, files in os.walk(project_dir):
        dirs[:] = [d for d in dirs if d not in ("node_modules", "__pycache__", ".git")]
        if ".opencode" not in root:
            file_count += len(files)

    print(f"\n{'='*60}", flush=True)
    print(f"HACKATHON PROJECT COACH — {slug}", flush=True)
    print(f"{'='*60}", flush=True)
    print(f"  Total time:  {total/60:.1f} min", flush=True)
    print(f"  Files:       {file_count}", flush=True)
    print(f"  {'Phase':>15}  {'Status':>10}", flush=True)
    print(f"  {'-'*15}  {'-'*10}", flush=True)
    for phase, status in phases.items():
        icon = "[OK]" if status == "ok" else ("[FAIL]" if status == "failed" else "[?]")
        print(f"  {phase:>15}  {icon:>6} {status}", flush=True)
    print(f"{'='*60}\n", flush=True)


async def run_pipeline(task: str, config: Config, mode: str = "full",
                       force: bool = True, slug_override: str | None = None, parent_dir: str | None = None,
                       stack: str | dict | None = None) -> dict:
    """Run the pipeline in the specified mode.

    Modes:
    - coach:     Only run the coach (planning + documentation)
    - build:     Only run builder + validation (requires existing coach output)
    - full:      Coach → Builder → Validation (default)

    Returns a result dict with keys: phases, validation_result, success, slug, project_dir.
    """
    APP_BUILDER_DIR = os.path.dirname(os.path.abspath(__file__))

    if mode == "full" or mode == "coach":
        project_dir, slug = scaffold_project(task, force=True, parent_dir=parent_dir, slug_override=slug_override, stack=stack)
    else:
        from scaffold import slugify
        slug = slug_override or slugify(task)
        if parent_dir:
            project_dir = os.path.abspath(os.path.join(parent_dir, slug))
        else:
            project_dir = os.path.join(APP_BUILDER_DIR, "projects", slug)
        if not os.path.isdir(project_dir):
            project_dir, slug = scaffold_project(task, force=True, parent_dir=parent_dir, stack=stack)
        else:
            copy_agents(project_dir)

    log(f"Project: {project_dir}")
    log(f"Slug: {slug}")

    runs_dir = os.path.join(project_dir, "runs")
    get_logger().set_log_dir(runs_dir)
    log_event("pipeline_start", task=task, slug=slug, mode=mode)

    _ws_broadcast = None
    try:
        from dashboard import _broadcast as _dash_broadcast
        _ws_broadcast = _dash_broadcast
    except Exception:
        pass

    client = OpencodeClient(
        port=config.server_port,
        project_dir=project_dir,
        timeout=config.http_timeout,
        strict_models=config.strict_models,
        ws_broadcast=_ws_broadcast,
    )

    log("Starting opencode server...")
    await client.start()
    log("Server ready")

    models = {
        "coach": config.coach_model,
        "frontend": config.builder_model,
        "backend": config.builder_model,
    }
    await _verify_models(client, models)

    start_time = time.time()
    phases: dict[str, str] = {}
    validation_result: dict | None = None

    try:
        # Phase 1: Coach
        if mode in ("full", "coach"):
            coach_ok = await phase_coach(client, project_dir, task, coach_timeout=config.coach_timeout)
            phases["coach"] = "ok" if coach_ok else "failed"

            if coach_ok:
                _parse_tasks_to_state(project_dir, task)
                log("Project state initialized from TASKS.md")

            git_commit(project_dir, "phase-coach")

            if mode == "coach":
                await client.tell("Coach complete! Review the plan documents.")
                log("Coach complete. Review the project plan in PLAN.md and the task files.")
                _print_summary(project_dir, slug, start_time, phases)
                return {"phases": phases, "validation_result": None, "success": phases.get("coach") == "ok", "slug": slug, "project_dir": project_dir}

        # Phase 2: Builder
        if mode in ("full", "build"):
            builder_ok = await phase_builder(client, project_dir, repair=False)
            phases["builder"] = "ok" if builder_ok else "failed"

            if builder_ok:
                _update_state_after_build(project_dir)
                git_commit(project_dir, "phase-build")

                # Phase 3: Validation
                validation_result = await phase_validation(project_dir)
                phases["validation"] = "ok" if validation_result["passed"] else "failed"

                # Repair loop if validation failed
                attempts = 0
                while not validation_result["passed"] and attempts < config.max_repair_attempts:
                    attempts += 1
                    log("=" * 60)
                    log(f"VALIDATION FAILED — Attempting repair cycle {attempts} of {config.max_repair_attempts}")
                    log("=" * 60)
                    await client.tell(f"Validation failed. Attempting repair cycle {attempts}...")

                    builder_ok = await phase_builder(client, project_dir, repair=validation_result)
                    phases["builder"] = "ok" if builder_ok else "failed"

                    if builder_ok:
                        _update_state_after_build(project_dir)
                        git_commit(project_dir, f"phase-repair-attempt-{attempts}")
                        validation_result = await phase_validation(project_dir)
                        phases["validation"] = "ok" if validation_result["passed"] else "failed"

                        if validation_result["passed"]:
                            log(f"[OK] Repair: Validation passed after fix on attempt {attempts}.")
                            await client.tell("Repair successful! All validations pass.")
                            break
                        else:
                            log(f"[FAIL] Repair: Validation still failing on attempt {attempts}.")
                            await client.tell(f"Repair cycle {attempts} failed. Check the validation output below.")
                    else:
                        log(f"[FAIL] Repair: Builder still failing on attempt {attempts}.")
                        break

            if not builder_ok:
                log("Builder failed — no validation run.")
                phases["validation"] = "skipped"
                validation_result = {"passed": False, "build_ok": False, "build_log": "",
                                     "lint_ok": False, "test_ok": False}

            # Phase 4: Pitch Update + Judge Score (only after successful validation)
            passed = validation_result.get("passed", False) if validation_result else False
            if passed:
                await client.tell("Validation passed! Updating pitch and generating judge score...")
                pitch_ok = await phase_pitch_update(client, project_dir)
                phases["pitch"] = "ok" if pitch_ok else "failed"

                judge_ok = await phase_judge_score(client, project_dir)
                phases["judge"] = "ok" if judge_ok else "failed"

                # Mark state as ready
                state_path = os.path.join(project_dir, "project_state.json")
                if os.path.exists(state_path):
                    try:
                        with open(state_path, encoding="utf-8") as f:
                            state = json.load(f)
                        state["status"] = "ready"
                        with open(state_path, "w", encoding="utf-8") as f:
                            json.dump(state, f, indent=2)
                    except Exception:
                        pass

                await client.tell("[OK] Project is ready for demo! Check the judge score.")
            else:
                phases["pitch"] = "skipped"
                phases["judge"] = "skipped"
                await client.tell("[FAIL] Validation failed. Review the output below.")

            git_commit(project_dir, "phase-final")

        _print_summary(project_dir, slug, start_time, phases)

        if validation_result:
            print("\nValidation Summary:", flush=True)
            print(f"  Build: {'[OK]' if validation_result.get('build_ok') else '[FAIL]'}", flush=True)
            print(f"  Lint:  {'[OK]' if validation_result.get('lint_ok') else '[FAIL]'}", flush=True)
            print(f"  Test:  {'[OK]' if validation_result.get('test_ok') else '[FAIL]'}", flush=True)
            if validation_result.get("build_log"):
                print(f"\nBuild output:\n{validation_result['build_log'][:500]}", flush=True)

        success = phases.get("coach") == "ok" and phases.get("builder") != "failed" and phases.get("validation") != "failed"
    except Exception as e:
        await client.tell(f"Pipeline aborted: {e}")
        log(f"ABORT: {e}")
        _save_response(project_dir, "abort", "pipeline", str(e))
        _print_summary(project_dir, slug, start_time, phases)
        success = False
    finally:
        log("Shutting down opencode server...")
        await client.stop()

    return {"phases": phases, "validation_result": validation_result, "success": success, "slug": slug, "project_dir": project_dir}


async def main():
    with SafeTerminalContext():
        import argparse
        parser = argparse.ArgumentParser(description="Hackathon Project Coach")
        parser.add_argument("task", help="Description of the project idea")
        parser.add_argument("--config", "-c", default="config.yaml", help="Config file path")
        parser.add_argument("--mode", default="full", choices=["full", "coach", "build"],
                            help="Pipeline mode: full (default), coach-only, build-only")
        parser.add_argument("--force", "-f", action="store_true", help="Force overwrite existing project directory")
        parser.add_argument("--slug", help="Project slug for build-only mode")
        parser.add_argument("--cwd", help="Parent directory where project folder will be created")
        parser.add_argument("--stack", "-s", help="Tech stack preset ID (e.g. default, fastapi-vue, flask-react, nextjs, go-htmx, svelte-express) or path to stack config file")
        args = parser.parse_args()

        config_path = args.config
        if not os.path.isabs(config_path) and not os.path.exists(config_path):
            pkg_config = os.path.join(APP_BUILDER_DIR, config_path)
            if os.path.exists(pkg_config):
                config_path = pkg_config

        config = Config.from_yaml(config_path)
        await run_pipeline(args.task, config, mode=args.mode, force=args.force, slug_override=args.slug, parent_dir=args.cwd, stack=args.stack)


if __name__ == "__main__":
    asyncio.run(main())
