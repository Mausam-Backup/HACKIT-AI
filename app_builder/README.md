# HACKIT — Autonomous AI App Builder & Hackathon Coach

From **idea → plan → working demo → pitch** in minutes.

## Quick Start

```bash
# Launch interactive HACKIT Chat TUI
hackit

# Or launch HACKIT Web GUI
hackit gui
```

Open http://127.0.0.1:4097 for the Web GUI Dashboard.

## How It Works

1. **Coach Agent** — Analyzes your idea, defines MVP, generates architecture, milestones, and documentation (`PLAN.md`, `ARCHITECTURE.md`, `TASKS.md`)
2. **Builder Agents** — Generates full project (Vite+React frontend + Express backend in parallel)
3. **Validation & Auto-repair** — Runs `npm run build` / lint / test; up to 2 auto-repair iterations if needed
4. **Pitch & Evaluation** — Regenerates `HACKATHON.md` pitch guide and evaluates project against hackathon criteria (`JUDGE_SCORE.md`)

## Interactive CLI Commands

```bash
hackit                            # Interactive HACKIT Chat TUI
hackit "expense tracker app"      # Direct prompt build
hackit gui                        # Launch Web GUI Dashboard
```

## Project Structure

| Directory / File | Purpose |
|------------------|---------|
| `bin/cli.js` | Executable Node launcher for `hackit` |
| `tui.py` | Interactive HACKIT Chat TUI interface |
| `dashboard.py` | FastAPI Web GUI server |
| `projects/` | Generated applications (one per project) |
| `prompts/` | Agent system prompts (coach, frontend, backend, pitch, judge) |
| `agents/` | OpenCode agent definitions |
| `tests/` | Pytest unit test suite |

