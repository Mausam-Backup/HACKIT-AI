# 🚀 HACKIT — Autonomous AI App Builder & Hackathon Coach

[![npm version](https://img.shields.io/npm/v/hackit-ai.svg?color=blue&style=flat-square)](https://www.npmjs.com/package/hackit-ai)
[![license](https://img.shields.io/npm/l/hackit-ai.svg?color=green&style=flat-square)](https://github.com/npm/cli)
[![node version](https://img.shields.io/node/v/hackit-ai.svg?style=flat-square)](https://nodejs.org)

> **From idea → plan → full-stack code → validation → hackathon pitch in minutes.**

**HACKIT** (`hackit-ai`) is an autonomous, multi-agent AI system packaged into an interactive React/Ink Terminal User Interface (TUI). It acts as your AI Hackathon Coach and lead engineer—analyzing project ideas, architecting full-stack applications (Vite + React frontend & Node.js/Express backend), generating comprehensive documentation, running automated compilation checks with self-repair, and scoring your project against real hackathon judging rubrics.

---

## ⚡ Quick Start

You can run HACKIT instantly using `npx` (no pre-installation required):

```bash
npx hackit-ai
```

Or install it globally to access the `hackit` command anywhere on your system:

```bash
npm install -g hackit-ai

# Launch interactive Chat TUI
hackit

# Or build directly with a prompt
hackit "create an AI-powered expense tracker for Indians"
```

---

## ✨ Key Features

- **🧠 Coach Agent (Planning & Spec Generation)**: Analyzes your prompt, cuts unnecessary scope, defines MVP features, and generates complete architectural docs (`PLAN.md`, `ARCHITECTURE.md`, `TASKS.md`, `WALKTHROUGH.md`, `NEXT-STEPS.md`).
- **⚡ Parallel Builder Agents**: Generates a complete full-stack web application concurrently—building a modern React (Vite + Lucide Icons) frontend and a Node.js/Express (SQLite) backend.
- **🎨 Built-in UI Design System**: Automatically enforces sleek dark-mode aesthetics, glassmorphism cards, responsive layouts, loading states, empty-state artwork, and pre-populated seed data so your app looks alive on first boot.
- **🔄 Automated Build & Self-Repair**: Executes `npm run build`, linting, and automated tests. If a syntax or build error occurs, HACKIT automatically analyzes the failure logs and executes up to 2 repair iterations.
- **🎤 Pitch & Judge Scorer**: Generates a 3-minute hackathon pitch deck and demo script (`HACKATHON.md`) and evaluates your project against real competition rubrics (`JUDGE_SCORE.md`).
- **💻 Responsive Terminal UI**: Built with React & Ink. Features live stage progress tracking, scrollable build logs, a tech stack switcher, and post-pipeline follow-up prompts.

---

## ⌨️ Interactive TUI Controls & Shortcuts

When running the interactive `hackit` terminal interface:

| Key / Command | Action |
|:---|:---|
| `Tab` | Cycle through Tech Stack presets (Vite + React + Express, Next.js, Vanilla, Vue 3, Custom) |
| `↑` / `↓` Arrow Keys | Scroll live pipeline logs up and down during or after a run |
| `/new` | Reset current workspace and start a fresh project idea |
| `Ctrl + C` | Safely exit the CLI and restore terminal screen state |

---

## 🏗️ Architecture & Pipeline Stages

```
 ┌───────────────────────────────────────────────────────────┐
 │                  1. Coach Planning Phase                  │
 │ Analyzes prompt, designs schema, writes PLAN & ARCH       │
 └─────────────────────────────┬─────────────────────────────┘
                               │
                               ▼
 ┌───────────────────────────────────────────────────────────┐
 │                  2. Parallel Code Builder                 │
 │ ├── Frontend Builder (Vite + React 18 + Lucide Icons)     │
 │ └── Backend Builder  (Node.js + Express + SQLite)         │
 └─────────────────────────────┬─────────────────────────────┘
                               │
                               ▼
 ┌───────────────────────────────────────────────────────────┐
 │             3. Validation & Auto-Repair Loop              │
 │ Runs npm run build; auto-repairs code if compilation fails│
 └─────────────────────────────┬─────────────────────────────┘
                               │
                               ▼
 ┌───────────────────────────────────────────────────────────┐
 │              4. Pitch Generator & Judge Score             │
 │ Produces HACKATHON.md demo script & JUDGE_SCORE.md audit  │
 └───────────────────────────────────────────────────────────┘
```

---

## 📄 Generated Project Artifacts

Every project created by HACKIT is saved in its own directory containing full source code and complete documentation:

```
my-project/
├── frontend/             # React 18 + Vite 5 frontend app
├── backend/              # Node.js + Express API server
├── package.json          # Concurrent root runner ("npm run dev")
├── PLAN.md               # Executive summary, MVP scope, stretch goals
├── ARCHITECTURE.md       # Technical design, component map, DB schema
├── TASKS.md              # Checkbox task tracking list
├── WALKTHROUGH.md        # Codebase directory map & manual verification steps
├── NEXT-STEPS.md         # Prompts for incremental feature expansion
├── HACKATHON.md          # 3-minute pitch outline & live demo script
└── JUDGE_SCORE.md        # AI judge scoring against hackathon rubrics
```

---

## 🛠️ Configuration (`config.yaml`)

HACKIT can be customized via `config.yaml` or environment variables:

```yaml
# Server Port Configuration
server_port: 4190

# AI Model Overrides
coach_model: opencode/gpt-4o
builder_model: opencode/gpt-4o

# Pipeline Execution Settings
coach_timeout: 1800
builder_timeout: 1800
max_repair_attempts: 2
strict_models: false
```

---

## 💻 Tech Stack Presets

Select your stack before starting a project:
- **Vite + React + Express** *(Default / Recommended)*
- **Next.js + Tailwind + Supabase**
- **Vanilla HTML + JS + CSS**
- **Vue 3 + Vite + Node**
- **Custom Tech Stack** *(Specified directly in your prompt)*

---

## 📋 Requirements

- **Node.js**: `>= 18.0.0`
- **Python**: `>= 3.11` (automatically sets up lightweight runtime dependencies on first run via `postinstall`)

---

## 📄 License

MIT © [Google DeepMind Advanced Agentic Coding Team](https://github.com/npm/cli)
