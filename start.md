# HACKIT-AI Quick Start Guide

This guide explains everything you need to know to get the HACKIT-AI presentation and hackathon platform running from scratch on a new machine.

## Prerequisites

Before you start, make sure you have the following installed on your machine:

1. **Node.js (v20+)** - Required for the frontend.
2. **Python (3.11)** - Required for the backend.
3. **uv** - A fast Python package manager. Install it by running:
   - macOS/Linux: `curl -LsSf https://astral.sh/uv/install.sh | sh`
   - Windows: `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`

---

## 1. First-Time Setup: Environment Variables

Before running the backend, you need to set up your environment variables for API keys (like Google Gemini, OpenAI, etc).

1. Go into the `backend` folder.
2. Duplicate the `.env.example` file (if it exists) and name the new file `.env`.
3. Fill in your LLM provider API keys (e.g. `GOOGLE_API_KEY`) and image provider keys in the `.env` file.

---

## 2. Start the Frontend

The frontend is a Next.js application that runs on port 3000.

Open a terminal and run:

```powershell
cd frontend
npm install   # Installs all necessary Node packages (first-time only)
npm run dev   # Starts the development server
```

_The frontend UI will now be available in your browser at `http://localhost:3000`_

---

## 3. Start the Backend

The backend is a FastAPI Python application running on port 8000. It handles LLM calls, document parsing, and exporting.

Open a **second** terminal and run the commands that apply to your system:

### Option A: Standard Startup (Mac / Linux / Standard Windows)

Use this if you don't have strict Application Control policies blocking virtual environments:

```powershell
cd backend
uv sync
uv run python server.py --port 8000 --reload true
```

### Option B: Restricted Windows Startup

If your Windows machine aggressively blocks downloaded executables or `.venv` virtual environments (e.g., throwing "Part of this app has been blocked" or `os error 4551`), you must install an official Python 3.11 from the Microsoft Store or Python.org first. Then, install dependencies globally:

```powershell
cd backend
# 1. Install dependencies globally to the system Python 3.11
uv pip install -e . --system --python C:\Users\rikik\AppData\Local\Programs\Python\Python311\python.exe

# 2. Start the server using the system Python directly
C:\Users\rikik\AppData\Local\Programs\Python\Python311\python.exe server.py --port 8000 --reload true
```

_(Note: Be sure to change the path above if your Python 3.11 is installed somewhere else!)_

_The backend API will now be active at `http://localhost:8000`_

---

## How It Works Under the Hood

1. **The Client (Frontend):** You interact with the Next.js frontend on `http://localhost:3000`. This provides the beautiful UI, drag-and-drop slide editors, and dashboard.
2. **The Proxy:** Whenever the frontend needs data or needs to trigger an AI generation, it makes a request to `/api/v1/...`. Next.js automatically proxies these requests to the FastAPI backend running on port 8000 behind the scenes.
3. **The Brain (Backend):** The FastAPI server receives the request. It connects to its local SQLite database, processes file uploads, and makes external API calls to LLM providers (like Gemini or Anthropic) to generate outlines and slide content.
4. **Real-time Updates:** For long-running tasks like generating a presentation, the backend uses Server-Sent Events (SSE) to stream chunks of text back to the frontend in real-time, giving you that typing-effect animation as the slides are created!
