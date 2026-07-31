# 🛠️ HACKIT-AI App Builder CLI

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![Typer](https://img.shields.io/badge/Typer-CLI-000000.svg?style=flat&logo=terminal&logoColor=white)](https://typer.tiangolo.com/)
[![Textual](https://img.shields.io/badge/Textual-TUI-purple.svg?style=flat)](#)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The **App Builder CLI** is the autonomous, multi-agent terminal interface for HACKIT-AI. It takes a single natural language text prompt and autonomously scaffolds a complete, production-ready full-stack application (frontend + backend). 

It utilizes specialized LLM sub-agents to coach, architect, code, and generate pitch slides for your hackathon project.

---

## 🏗️ Core Architecture & Agent Swarm

The CLI operates using a specialized state machine defined in `orchestrator.py`. Rather than relying on a single LLM call, it spins up a **swarm of specialized AI agents**, each with a distinct role:

1. **The Coach Agent:** Validates your initial prompt. It checks for originality, technical feasibility, and suggests improvements to make your app more "hackathon-ready".
2. **The Architect Agent:** Designs the database schema, API contracts, and the file structure.
3. **The Coder Agent (Frontend & Backend):** Generates the actual source code (React/Vite for frontend, Express/FastAPI for backend).
4. **The Reviewer Agent:** Scans the generated code for syntax errors and architectural inconsistencies.
5. **The Pitch Deck Agent:** Extracts the core features of the generated app and sends them to the main HACKIT-AI backend to generate a `.pptx` presentation for your pitch.

---

## 📂 Detailed Folder Structure

| Directory / File | Description |
|------------------|-------------|
| `agents/` | Contains the system prompts and specification definitions mapping for the LLM multi-agent swarm. |
| ↳ `coach.md` | System prompt dictating the strict evaluation criteria for the Hackathon Coach. |
| ↳ `frontend.md` | Instructions for React/Vite scaffolding. |
| ↳ `backend.md` | Instructions for the server-side API generation. |
| `app_builder/` | The designated output directory where the scaffolded Node.js/Python projects are dumped. |
| `cli.py` | The main Typer command-line interface entry point. Handles argument parsing (`start`, `build`). |
| `orchestrator.py` | The core state machine that orchestrates the handoffs and memory sharing between different specialized LLMs. |
| `tui.py` | The interactive Terminal User Interface (TUI) built with Textual and Rich for real-time streaming feedback. |
| `hackit_client.py` | A REST client wrapper used by the CLI to interface with the main FastAPI backend for advanced tasks (like slide generation). |

---

## 🚀 Features

- **End-to-End Generation:** Automatically creates React/Vite frontends and Express/FastAPI backends from scratch.
- **Beautiful Terminal UI:** Watch the agents "think" and generate code in real-time using the Textual UI.
- **Docker Ready:** Scaffolds a `Dockerfile` and `docker-compose.yml` automatically so the generated app can be run instantly via `docker compose up`.
- **API Key Management:** Easily configure which LLM provider you want the CLI to use (OpenAI, Anthropic, Groq, etc.).

---

## 💻 Quick Start Guide

### 1. Configuration
Make sure you have configured your LLM provider keys in the main `.env` file at the root of the repository.

### 2. Running the CLI
You can run the CLI in two modes:

**Interactive Mode (TUI):**
```bash
python cli.py start
```

**Direct Headless Build:**
```bash
python cli.py build "Create an expense tracker app with a dashboard, PostgreSQL database, and dark mode UI"
```

### 3. Running the Generated App
Once the CLI finishes successfully, your app will be waiting in the `app_builder/` folder.
```bash
cd app_builder/output
docker compose up --build
```
