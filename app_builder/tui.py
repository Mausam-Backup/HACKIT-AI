import os
import re
import sys
import time
import asyncio
import signal
import subprocess
import atexit
from pathlib import Path
from rich.console import Console, Group
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.prompt import Prompt
from rich.spinner import Spinner

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from structured_log import register_ws_callback
from orchestrator import run_pipeline
from config import Config

console = Console()

HACKIT_BANNER = """[bold cyan]
  ██╗  ██╗ █████╗  ██████╗██╗  ██╗██╗████████╗
  ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██║╚══██╔══╝
  ███████║███████║██║     █████╔╝ ██║   ██║
  ██╔══██║██╔══██║██║     ██╔═██╗ ██║   ██║
  ██║  ██║██║  ██║╚██████╗██║  ██╗██║   ██║
  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝   ╚═╝
[/][bold gold1]   Autonomous AI Hackathon Coach & App Builder CLI[/]
"""

current_stage = "initializing"
logs_buffer = []
_start_time = 0.0
stages_status = {
    "coach": "pending",
    "builder": "pending",
    "validation": "pending",
    "pitch": "pending"
}

_dash_process = None


def _cleanup_dash():
    global _dash_process
    if _dash_process is not None and _dash_process.poll() is None:
        try:
            _dash_process.terminate()
            _dash_process.wait(timeout=3)
        except Exception:
            try:
                _dash_process.kill()
            except Exception:
                pass
        _dash_process = None


atexit.register(_cleanup_dash)


def tui_event_handler(event: str, **kwargs):
    global current_stage, _start_time
    msg = kwargs.get("message", "")

    if event == "coach_start":
        stages_status["coach"] = "active"
        current_stage = "planning"
    elif event == "coach_complete":
        stages_status["coach"] = "done" if kwargs.get("success", True) else "failed"
    elif event == "builder_start":
        stages_status["builder"] = "active"
        current_stage = "building"
    elif event == "builder_complete":
        stages_status["builder"] = "done" if kwargs.get("success", True) else "failed"
    elif event == "validation_start":
        stages_status["validation"] = "active"
        current_stage = "validating"
    elif event == "validation_complete":
        stages_status["validation"] = "done" if kwargs.get("passed", True) else "failed"
    elif event in ("pitch_update_start", "judge_start"):
        stages_status["pitch"] = "active"
        current_stage = "finalizing"
    elif event in ("pitch_update_complete", "judge_complete"):
        success = kwargs.get("success", True)
        stages_status["pitch"] = "done" if success else "failed"
    elif event == "pipeline_start":
        current_stage = "running"
        _start_time = time.time()

    if msg:
        clean_msg = str(msg).strip()
        if clean_msg and (not logs_buffer or logs_buffer[-1] != clean_msg):
            logs_buffer.append(clean_msg)
            if len(logs_buffer) > 50:
                logs_buffer.pop(0)


def reset_stages():
    global logs_buffer, current_stage, _start_time
    logs_buffer = []
    current_stage = "initializing"
    _start_time = 0.0
    for key in stages_status:
        stages_status[key] = "pending"


def _format_elapsed() -> str:
    if _start_time <= 0:
        return ""
    elapsed = time.time() - _start_time
    if elapsed < 60:
        return f"{elapsed:.0f}s elapsed"
    return f"{elapsed/60:.1f}min elapsed"


def generate_layout():
    icons = {
        "pending": "[grey37]○ Pending[/]",
        "active": Spinner("dots", style="bold orange1"),
        "done": "[green]✓ Complete[/]",
        "failed": "[red]✗ Failed[/]"
    }

    table = Table.grid(padding=(0, 2))
    table.add_column("Status", width=14)
    table.add_column("Step")

    table.add_row(icons[stages_status["coach"]], "[bold]1. Coach Planning[/] (PLAN, ARCHITECTURE, TASKS, PROMPTS)")
    table.add_row(icons[stages_status["builder"]], "[bold]2. Code Generation[/] (Vite+React Frontend & Express Backend)")
    table.add_row(icons[stages_status["validation"]], "[bold]3. Validation & Repair[/] (Build, Lint, Tests & Auto-repair)")
    table.add_row(icons[stages_status["pitch"]], "[bold]4. Pitch & Evaluation[/] (HACKATHON update & JUDGE score)")

    log_text = Text()
    for log_line in logs_buffer:
        if "coach" in log_line.lower():
            log_text.append("  [HACKIT:Coach] ", style="bold cyan")
        elif "frontend" in log_line.lower() or "builder" in log_line.lower():
            log_text.append("  [HACKIT:Frontend] ", style="bold green")
        elif "backend" in log_line.lower():
            log_text.append("  [HACKIT:Backend] ", style="bold yellow")
        else:
            log_text.append("  ", style="grey62")
        log_text.append(f"{log_line}\n", style="grey78")

    elapsed_text = _format_elapsed()
    progress_title = "[bold gold1]HACKIT Agent Pipeline Progress[/]"
    if elapsed_text:
        progress_title += f"  [{elapsed_text}]"

    progress_panel = Panel(
        table,
        title=progress_title,
        border_style="orange1",
        padding=(1, 2)
    )

    logs_panel = Panel(
        log_text,
        title="[bold cyan]Live Agent Streaming Activity[/]",
        border_style="cyan",
        padding=(1, 2),
        height=14
    )

    header_text = Text(" HACKIT - Autonomous AI App Builder & Hackathon Coach", style="bold white on blue")

    return Group(
        header_text,
        Text("\n"),
        progress_panel,
        Text("\n"),
        logs_panel
    )


from stack_manager import list_stacks


def show_help():
    table = Table(title="HACKIT CLI Commands", show_header=True, header_style="bold magenta")
    table.add_column("Command", style="cyan")
    table.add_column("Description")
    table.add_row("/gui or /dashboard", "Launch interactive Web GUI dashboard")
    table.add_row("/plan <idea>", "Run Coach planning phase only (docs + architecture)")
    table.add_row("/build <idea>", "Run full pipeline (Coach -> Builder -> Validation)")
    table.add_row("/list or /projects", "List previously built projects")
    table.add_row("/stacks [filter]", "List available tech stack presets, optional filter")
    table.add_row("/clear", "Clear terminal screen")
    table.add_row("/exit or /quit", "Exit HACKIT CLI")
    table.add_row("<project idea> [--stack STACK]", "Type any project idea to run full build")
    console.print(table)


def show_stacks(filter_text: str = ""):
    stacks = list_stacks()
    table = Table(title="Available Tech Stacks", show_header=True, header_style="bold green")
    table.add_column("ID / Key", style="cyan", no_wrap=True)
    table.add_column("Name", style="bold white")
    table.add_column("Description")
    shown = 0
    for key, info in stacks.items():
        if filter_text:
            lower = filter_text.lower()
            if lower not in key.lower() and lower not in info.get("name", "").lower() and lower not in info.get("description", "").lower():
                continue
        table.add_row(key, info.get("name", key), info.get("description", ""))
        shown += 1
    if shown == 0:
        console.print(f"[yellow]No stacks match '{filter_text}'[/]")
    else:
        console.print(table)


def _extract_stack_flag(task_input: str) -> tuple[str, str | None]:
    """Extract --stack NAME or --stack=NAME from task input. Returns (cleaned_input, stack_name)."""
    m = re.search(r'--stack(?:=|\s+)([\w.-]+)', task_input)
    if m:
        stack_val = m.group(1)
        cleaned = re.sub(r'--stack(?:=|\s+)[\w.-]+', '', task_input, count=1)
        cleaned = re.sub(r'  +', ' ', cleaned).strip()
        return cleaned, stack_val
    return task_input, None


def show_projects():
    projects_dir = Path(os.path.dirname(os.path.abspath(__file__))) / "projects"
    if not projects_dir.is_dir():
        console.print("[yellow]No projects directory found. Run a build first![/]")
        return
    entries = []
    for d in sorted(projects_dir.iterdir()):
        if not d.is_dir():
            continue
        slug = d.name
        state_path = d / "project_state.json"
        status = "unknown"
        if state_path.is_file():
            try:
                import json
                data = json.loads(state_path.read_text(encoding="utf-8", errors="replace"))
                status = data.get("status", "unknown")
            except Exception:
                pass
        has_fe = (d / "frontend").is_dir()
        has_be = (d / "backend").is_dir()
        has_plan = (d / "PLAN.md").is_file()
        phase = "done" if (has_fe or has_be) and has_plan else "planned" if has_plan else "new"
        entries.append((slug, phase, status))
    if not entries:
        console.print("[yellow]No projects found in ./projects/[/]")
        return
    table = Table(title="Built Projects", show_header=True, header_style="bold green")
    table.add_column("Slug", style="cyan", no_wrap=True)
    table.add_column("Phase", style="bold white")
    table.add_column("Status")
    for slug, phase, status in entries:
        phase_color = {"done": "green", "planned": "yellow", "new": "grey"}.get(phase, "white")
        table.add_row(slug, f"[{phase_color}]{phase}[/]", status)
    console.print(table)


async def execute_task(task_input: str, mode: str = "full", parent_dir: str = ".", stack: str | None = None):
    reset_stages()
    parent_dir = os.path.abspath(parent_dir)
    config = Config.from_yaml()

    clean_input, parsed_stack = _extract_stack_flag(task_input)
    task_input = clean_input
    parsed_stack = parsed_stack or stack

    console.print(f"\n[bold green]🚀 [HACKIT] Initializing workspace for idea:[/] [cyan]{task_input}[/]")
    if parsed_stack:
        console.print(f"[bold yellow]Tech Stack:[/] [cyan]{parsed_stack}[/]\n")
    else:
        console.print()

    with Live(generate_layout(), console=console, refresh_per_second=4) as live:
        try:
            result = await run_pipeline(
                task=task_input,
                config=config,
                mode=mode,
                parent_dir=parent_dir,
                stack=parsed_stack
            )
        except Exception as e:
            logs_buffer.append(f"FATAL ERROR: {e}")
            result = {"success": False, "slug": "", "project_dir": ""}

        live.update(generate_layout())

    slug = result.get("slug") or ""
    project_path = result.get("project_dir") or ""
    success = result.get("success", False)

    if project_path and slug:
        color = "bold green" if success else "bold red"
        header = "SUCCESS" if success else "FAILED"
        console.print("\n" + "=" * 64, style=color)
        console.print(f"{'🎉' if success else '❌'} {header}: Project [bold cyan]{slug}[/] {'ready!' if success else 'had errors'}", style=color)
        console.print("=" * 64 + "\n", style=color)

        console.print(f"📁 Project Path: [bold]{project_path}[/]")
        if success:
            console.print(f"🚀 Quick Start: [bold yellow]cd \"{project_path}\" && npm run dev[/]\n")
        else:
            console.print(f"❌ Quick Start: [red]Build did not pass. Check logs above for details.[/]\n")
    else:
        console.print("\n[red]Pipeline completed but no project information was returned.[/]\n")


async def main_async():
    global _dash_process
    os.environ["RUNNING_IN_TUI"] = "1"
    register_ws_callback(tui_event_handler)

    console.clear()
    console.print(HACKIT_BANNER)

    cli_args = process_cli_args()
    if cli_args:
        await execute_task(cli_args)
        return

    console.print("[dim]Type your project idea or type [bold cyan]/help[/] for commands.[/dim]\n")

    while True:
        try:
            user_input = Prompt.ask("[bold cyan]hackit >[/]").strip()
            if not user_input:
                continue

            cmd_lower = user_input.lower()

            if cmd_lower in ("/exit", "/quit", "exit", "quit"):
                _cleanup_dash()
                console.print("\n[bold orange1]Goodbye from HACKIT! Happy hacking![/]\n")
                break

            elif cmd_lower in ("/help", "help"):
                show_help()

            elif cmd_lower in ("/stacks", "stacks"):
                show_stacks()
            elif cmd_lower.startswith("/stacks ") or cmd_lower.startswith("stacks "):
                parts = cmd_lower.split(maxsplit=1)
                show_stacks(parts[1] if len(parts) > 1 else "")

            elif cmd_lower in ("/list", "/projects", "list", "projects"):
                show_projects()

            elif cmd_lower in ("/gui", "/dashboard", "gui", "dashboard"):
                if _dash_process is not None and _dash_process.poll() is None:
                    console.print("[yellow]Dashboard is already running at [bold cyan]http://127.0.0.1:4097[/][/]\n")
                else:
                    console.print("\n[bold green]🚀 Launching HACKIT Web GUI Server...[/]")
                    dash_path = os.path.join(os.path.dirname(__file__), "dashboard.py")
                    _dash_process = subprocess.Popen(
                        [sys.executable, dash_path],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                    )
                    console.print("🌐 Dashboard server running at [bold cyan]http://127.0.0.1:4097[/]\n")

            elif cmd_lower in ("/clear", "clear"):
                console.clear()
                console.print(HACKIT_BANNER)

            elif cmd_lower.startswith("/plan "):
                idea = user_input[6:].strip()
                if idea:
                    await execute_task(idea, mode="coach")
                else:
                    console.print("[red]Please specify an idea: /plan <your idea>[/]")

            elif cmd_lower.startswith("/build "):
                idea = user_input[7:].strip()
                if idea:
                    await execute_task(idea, mode="full")
                else:
                    console.print("[red]Please specify an idea: /build <your idea>[/]")

            else:
                await execute_task(user_input, mode="full")

        except (KeyboardInterrupt, EOFError):
            console.print("\n[bold orange1]HACKIT session closed.[/]\n")
            break


def process_cli_args() -> str | None:
    if len(sys.argv) <= 1:
        return None
    first = sys.argv[1].lower()
    if first in ("gui", "dashboard", "help", "--help"):
        return None
    return " ".join(sys.argv[1:])


if __name__ == "__main__":
    try:
        asyncio.run(main_async())
    except KeyboardInterrupt:
        console.print("\n[red]Process aborted by user.[/]")
    finally:
        _cleanup_dash()
