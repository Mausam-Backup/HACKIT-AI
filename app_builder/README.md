# 🛠️ HACKIT-AI App Builder CLI

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![Typer](https://img.shields.io/badge/Typer-CLI-000000.svg?style=flat&logo=terminal&logoColor=white)](https://typer.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The **App Builder CLI** is an autonomous, multi-agent terminal interface that takes a single text prompt and scaffolds a complete, production-ready full-stack application (frontend + backend). 

It utilizes specialized LLM sub-agents to coach, architect, code, and generate pitch slides for your hackathon project.

## 📂 Folder Structure

| Directory / File | Description |
|------------------|-------------|
| `agents/` | System prompts and spec definitions mapping for the LLM multi-agent swarm (`coach`, `coder`, `reviewer`). |
| `app_builder/` | The generation destination where scaffolded Node.js/Python projects are dumped. |
| `cli.py` | The main Typer command-line interface entry point. |
| `orchestrator.py` | The core state machine that orchestrates the handoffs between different specialized LLMs. |
| `tui.py` | Interactive Rich/Textual powered UI components for terminal rendering. |

## 🚀 Features

- **End-to-End Generation:** Automatically creates React/Vite frontends and Express/FastAPI backends.
- **AI Coach:** Validates your idea before writing code, checking for originality and technical feasibility.
- **Pitch Deck Generation:** Automatically extracts app features to generate a PowerPoint slide deck for your presentation.
- **Docker Ready:** Scaffolds `Dockerfile` and `docker-compose.yml` for instant deployment.

## 💻 Quick Start

Make sure you have configured your LLM provider keys in the main `.env`.

```bash
# Run the interactive setup
python cli.py start

# Or pass a prompt directly
python cli.py build "Create an expense tracker app with a dashboard"
```
