# ⚙️ HACKIT-AI Backend Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![Security](https://img.shields.io/badge/Security-PBKDF2--HMAC--SHA256-critical.svg)](#)

The central FastAPI nervous system for HACKIT-AI. This backend acts as the core hub for the entire application platform, managing everything from LLM API routing to asynchronous `.pptx` presentation generation.

---

## 🏗️ Core Subsystems

### 1. Multi-LLM Provider Factory (`llm_provider.py`)
Seamlessly routes prompts to 15+ different LLM providers (OpenAI, Anthropic, Google Gemini, Groq, Ollama, OpenRouter, etc.). It abstracts away the differing API schemas (e.g., standardizing OpenAI's schema vs Anthropic's Messages API) and provides automatic fallback handling. If an API key is exhausted, it automatically attempts to use a secondary provider.

### 2. Custom Enterprise Auth (`simple_auth.py`)
A robust, zero-dependency authentication system built specifically for HACKIT-AI without relying on third-party middleware (like FastAPI-Users or Auth0).
- **Hashing:** Implements NIST-recommended `PBKDF2-HMAC-SHA256` hashing (200,000 iterations) with 16-byte cryptographic salts (`secrets.token_bytes`).
- **2FA:** Built-in Two-Factor Authentication via TOTP using `pyotp`.
- **Sessions:** Manages secure, HttpOnly, signed session cookies.

### 3. V2 Slide Rendering Engine (`export_task_service.py`)
Compiles custom JSON presentation schemas (created by the frontend Canvas) into beautiful HTML layouts. Uses `python-pptx` to programmatically build PowerPoint decks, accurately mapping X/Y coordinates, bounding boxes, and typography rules directly from the web canvas to the native `.pptx` slides.

---

## 📂 Detailed Folder Structure

| Directory / File | Description |
|------------------|-------------|
| `api/` | The core REST routers. |
| ↳ `auth/` | Handles `/login`, `/register`, and `/verify-2fa` endpoints. |
| ↳ `slides/` | Endpoints to fetch layouts, trigger generation, and download exports. |
| ↳ `coach/` | WebSockets and REST endpoints for the AI Coach and Interviewer interactions. |
| `models/` | Pydantic data schemas for request validation (e.g., `SlideSchemaV2`, `LoginRequest`). |
| `services/` | Heavy-lifting business logic. |
| ↳ `export_task_service.py` | Asynchronous celery-like background tasks for PPTX/PDF generation. |
| ↳ `mem0_oss_memory.py` | Long-term memory storage for the LLMs using the Mem0 framework. |
| `utils/` | Utility functions. |
| ↳ `simple_auth.py` | Core security and authentication mechanisms. |
| ↳ `llm_provider.py` | The unified LLM factory interface. |
| `templates/` | Defines the strict JSON schemas and corresponding HTML templates for the slide builder. |
| `data/` | Acts as a lightweight local database, storing `user-config.json` and session hashes. |
| `server.py` | The main ASGI application entry point that bootstraps FastAPI. |

---

## 💻 Development Setup

```bash
# 1. Create a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Environment variables
# Copy .env.example to .env and configure your keys (OPENAI_API_KEY, RESEND_API_KEY, etc.)

# 4. Run the development server
python server.py --port 8000 --reload true
```
