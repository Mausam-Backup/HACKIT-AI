import json
import os
import sys

APP_BUILDER_DIR = os.path.dirname(os.path.abspath(__file__))
STACKS_DIR = os.path.join(APP_BUILDER_DIR, "stacks")

DEFAULT_STACK = {
    "id": "default",
    "name": "React 18 + Vite + Express",
    "description": "Standard React 18 frontend with Vite and Node.js Express backend using SQLite.",
    "frontend": {
        "framework": "React 18.x",
        "build_tool": "Vite 5.x",
        "icons": "lucide-react 0.469.x",
        "dir": "./frontend",
        "build_script": "npm run build",
        "test_script": "echo 'no tests yet' && exit 0"
    },
    "backend": {
        "framework": "Node.js / Express 4.x",
        "database": "SQLite (better-sqlite3)",
        "dir": "./backend",
        "port_env": "PORT_BACKEND",
        "build_script": "node --check server.js",
        "test_script": "echo 'no tests yet' && exit 0"
    },
    "custom_instructions": "",
    "base_template_dir": ""
}

PRESET_STACKS = {
    "default": DEFAULT_STACK,
    "fastapi-vue": {
        "id": "fastapi-vue",
        "name": "Vue 3 + Python FastAPI",
        "description": "Vue 3 Vite frontend with Python FastAPI backend and SQLite database.",
        "frontend": {
            "framework": "Vue 3",
            "build_tool": "Vite 5.x",
            "icons": "lucide-vue-next",
            "dir": "./frontend",
            "build_script": "npm run build",
            "test_script": "echo 'no tests yet' && exit 0"
        },
        "backend": {
            "framework": "Python 3 / FastAPI",
            "database": "SQLite (SQLAlchemy / Pydantic v2)",
            "dir": "./backend",
            "port_env": "PORT_BACKEND",
            "build_script": "python -m py_compile main.py",
            "test_script": "echo 'no tests yet' && exit 0"
        },
        "custom_instructions": "Use Pydantic v2 schemas for FastAPI endpoints. Serve API routes under /api/*.",
        "base_template_dir": ""
    },
    "flask-react": {
        "id": "flask-react",
        "name": "React 18 + Python Flask",
        "description": "React 18 frontend with Python Flask backend and SQLite database.",
        "frontend": {
            "framework": "React 18.x",
            "build_tool": "Vite 5.x",
            "icons": "lucide-react",
            "dir": "./frontend",
            "build_script": "npm run build",
            "test_script": "echo 'no tests yet' && exit 0"
        },
        "backend": {
            "framework": "Python 3 / Flask",
            "database": "SQLite (Flask-SQLAlchemy)",
            "dir": "./backend",
            "port_env": "PORT_BACKEND",
            "build_script": "python -m py_compile app.py",
            "test_script": "echo 'no tests yet' && exit 0"
        },
        "custom_instructions": "Build Flask backend REST API with endpoints under /api/* prefix.",
        "base_template_dir": ""
    },
    "nextjs": {
        "id": "nextjs",
        "name": "Next.js Fullstack",
        "description": "Fullstack Next.js App Router with React and API Routes.",
        "frontend": {
            "framework": "Next.js (React)",
            "build_tool": "Next.js App Router",
            "icons": "lucide-react",
            "dir": "./frontend",
            "build_script": "npm run build",
            "test_script": "echo 'no tests yet' && exit 0"
        },
        "backend": {
            "framework": "Next.js API Routes",
            "database": "SQLite / Prisma",
            "dir": "./backend",
            "port_env": "PORT_BACKEND",
            "build_script": "echo 'built with frontend' && exit 0",
            "test_script": "echo 'no tests yet' && exit 0"
        },
        "custom_instructions": "Build using Next.js App Router and API routes under /api/*.",
        "base_template_dir": ""
    },
    "go-htmx": {
        "id": "go-htmx",
        "name": "Go + HTMX + Tailwind",
        "description": "Go (Gin/Fiber) backend server with HTMX for dynamic UI and Tailwind CSS.",
        "frontend": {
            "framework": "HTMX + HTML5 + Tailwind CSS",
            "build_tool": "Tailwind CLI / Static",
            "icons": "Heroicons / FontAwesome",
            "dir": "./frontend",
            "build_script": "echo 'static assets' && exit 0",
            "test_script": "echo 'no tests yet' && exit 0"
        },
        "backend": {
            "framework": "Go (Gin or Fiber)",
            "database": "SQLite (mattn/go-sqlite3)",
            "dir": "./backend",
            "port_env": "PORT_BACKEND",
            "build_script": "go build -o server .",
            "test_script": "go test ./...",
            "run_cmd": "go run main.go"
        },
        "custom_instructions": "Render HTML templates using Go HTML templates and HTMX attributes. Serve API/HTML handlers.",
        "base_template_dir": ""
    },
    "svelte-express": {
        "id": "svelte-express",
        "name": "Svelte 5 + Express",
        "description": "Svelte 5 frontend with Node.js Express backend.",
        "frontend": {
            "framework": "Svelte 5",
            "build_tool": "Vite 5.x",
            "icons": "lucide-svelte",
            "dir": "./frontend",
            "build_script": "npm run build",
            "test_script": "echo 'no tests yet' && exit 0"
        },
        "backend": {
            "framework": "Node.js / Express 4.x",
            "database": "SQLite (better-sqlite3)",
            "dir": "./backend",
            "port_env": "PORT_BACKEND",
            "build_script": "node --check server.js",
            "test_script": "echo 'no tests yet' && exit 0"
        },
        "custom_instructions": "Build Svelte components in ./frontend/src/ and Express API in ./backend/server.js.",
        "base_template_dir": ""
    }
}


def list_stacks() -> dict[str, dict]:
    """Return dictionary of all available preset and file-defined stacks."""
    stacks = dict(PRESET_STACKS)
    if os.path.exists(STACKS_DIR):
        for fname in os.listdir(STACKS_DIR):
            if fname.endswith(".json") or fname.endswith(".yaml") or fname.endswith(".yml"):
                fpath = os.path.join(STACKS_DIR, fname)
                try:
                    loaded = _load_stack_file(fpath)
                    if loaded and "id" in loaded:
                        sid = loaded["id"]
                        if sid in stacks:
                            print(f"  WARNING: duplicate stack id '{sid}' in {fname} — overwriting", flush=True)
                        stacks[sid] = loaded
                except Exception:
                    pass
    return stacks


def _load_stack_file(filepath: str) -> dict | None:
    if not os.path.exists(filepath):
        return None
    with open(filepath, encoding="utf-8") as f:
        content = f.read()
    if filepath.endswith(".json"):
        return json.loads(content)
    elif filepath.endswith(".yaml") or filepath.endswith(".yml"):
        try:
            import yaml
            return yaml.safe_load(content)
        except ImportError:
            print("  WARNING: yaml package not available — skipping .yaml stack file", flush=True)
            return None
    return None


def resolve_stack(stack_input: str | dict | None) -> dict:
    """Resolve stack parameter (id, filepath, or dict) to full stack dict."""
    if not stack_input:
        return dict(DEFAULT_STACK)

    if isinstance(stack_input, dict):
        base = dict(DEFAULT_STACK)
        base.update(stack_input)
        return base

    if isinstance(stack_input, str):
        stack_str = stack_input.strip()
        all_stacks = list_stacks()

        # Check preset / registered ID
        if stack_str in all_stacks:
            return dict(all_stacks[stack_str])

        # Check file path
        if os.path.exists(stack_str):
            loaded = _load_stack_file(stack_str)
            if loaded:
                base = dict(DEFAULT_STACK)
                base.update(loaded)
                return base

    # Fallback to default
    return dict(DEFAULT_STACK)


def save_project_stack(project_dir: str, stack_config: dict):
    """Save stack_config.json inside the project directory."""
    os.makedirs(project_dir, exist_ok=True)
    out_path = os.path.join(project_dir, "stack_config.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(stack_config, f, indent=2, ensure_ascii=False)


def load_project_stack(project_dir: str) -> dict:
    """Load stack_config.json from project directory or return default."""
    cfg_path = os.path.join(project_dir, "stack_config.json")
    if os.path.exists(cfg_path):
        try:
            with open(cfg_path, encoding="utf-8") as f:
                loaded = json.load(f)
                base = dict(DEFAULT_STACK)
                base.update(loaded)
                return base
        except Exception:
            pass
    return dict(DEFAULT_STACK)
