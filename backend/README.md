# ⚙️ HACKIT-AI Backend Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![Security](https://img.shields.io/badge/Security-PBKDF2--HMAC--SHA256-critical.svg)](#)

The central FastAPI nervous system for HACKIT-AI. This backend manages multi-LLM routing (via 15+ providers), custom zero-dependency authentication, dynamic slide deck generation (`python-pptx`), and AI interview websocket streaming.

## 📂 Architecture & Folder Structure

| Directory | Description |
|-----------|-------------|
| `api/` | FastAPI REST routers organized by feature (`/auth`, `/slides`, `/coach`, `/hackathons`). |
| `models/` | Pydantic data schemas and strict validation models for API requests/responses. |
| `services/` | Core business logic, including `export_task_service.py` (PPTX/PDF generation) and `mem0_oss_memory.py` (Long-term LLM memory). |
| `utils/` | Utility functions. Includes `simple_auth.py` (custom PBKDF2 + 2FA logic) and `llm_provider.py` (LLM factory mapping). |
| `templates/` | The v2 schema JSON and HTML layouts for the dynamic slide deck rendering engine. |
| `data/` | Local JSON stores (`user-config.json`, `pending-users.json`) serving as the primary database. |
| `server.py` | The main ASGI application entry point. |

## 🚀 Key Subsystems

### 1. Multi-LLM Gateway
Seamlessly routes prompts to OpenAI, Anthropic, Google Gemini, Groq, Ollama, OpenRouter, and more based on user configuration, with automatic fallback handling and token tracking.

### 2. Custom Enterprise Auth
A fully custom authentication module built without third-party dependencies like Passlib or FastAPI-Users. Implements NIST-recommended `PBKDF2-HMAC-SHA256` hashing (200k iterations) and TOTP via `pyotp`.

### 3. V2 Slide Renderer
Compiles custom JSON presentation schemas into beautiful HTML layouts and exports them cleanly to `.pptx` or `.pdf` asynchronously.

## 💻 Development Setup

```bash
# 1. Create a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the development server
python server.py --port 8000 --reload true
```
