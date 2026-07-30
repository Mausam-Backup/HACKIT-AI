import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time

from string import Template
from stack_manager import resolve_stack, save_project_stack

try:
    import tiktoken
    HAS_TIKTOKEN = True
except ImportError:
    HAS_TIKTOKEN = False

try:
    import jinja2
    HAS_JINJA2 = True
except ImportError:
    HAS_JINJA2 = False

APP_BUILDER_DIR = os.path.dirname(os.path.abspath(__file__))
AGENTS_SOURCE = os.path.join(APP_BUILDER_DIR, "agents")
PROMPTS_SOURCE = os.path.join(APP_BUILDER_DIR, "prompts")



def slugify(text: str) -> str:
    h = hashlib.md5(text.encode()).hexdigest()[:8]
    clean = text.lower().strip()
    clean = re.sub(r"[^a-z0-9\s-]", "", clean)
    clean = re.sub(r"[\s-]+", "-", clean)
    return f"{clean[:52]}-{h}"


def _force_rmtree(path: str, retries=5, delay=1):
    try:
        import psutil
        path_abs = os.path.abspath(path)
        for proc in psutil.process_iter(['pid', 'cwd', 'cmdline']):
            try:
                cwd = proc.info.get('cwd')
                cmdline = proc.info.get('cmdline') or []
                if cwd and cwd.startswith(path_abs):
                    proc.kill()
                elif cmdline and any(path_abs in arg for arg in cmdline):
                    proc.kill()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
    except ImportError:
        pass
    for i in range(retries):
        try:
            if os.path.exists(path):
                if os.path.isdir(path):
                    shutil.rmtree(path)
                else:
                    os.remove(path)
            return
        except PermissionError:
            time.sleep(delay)
    if os.path.exists(path):
        import datetime
        stale = f"{path}.stale-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
        os.rename(path, stale)
        if not os.environ.get("RUNNING_IN_TUI"):
            print(f"  WARNING: could not fully remove {path} — renamed to {stale}")


def scaffold_project(task: str, force: bool = False, parent_dir: str = None, slug_override: str = None, stack: str | dict | None = None) -> tuple:
    slug = slug_override or slugify(task)
    if parent_dir:
        project_dir = os.path.abspath(os.path.join(parent_dir, slug))
    else:
        project_dir = os.path.join(APP_BUILDER_DIR, "projects", slug)

    if os.path.exists(project_dir) and not force:
        raise FileExistsError(
            f"Project '{slug}' already exists at {project_dir}. "
            f"Use --force to overwrite, or --resume to resume."
        )
    _force_rmtree(project_dir)

    # Save stack configuration
    stack_config = resolve_stack(stack)
    save_project_stack(project_dir, stack_config)

    for agent_dir in [
        os.path.join(project_dir, ".opencode", "agent"),
        os.path.join(project_dir, ".opencode", "agents"),
        os.path.join(project_dir, "agents"),
    ]:
        os.makedirs(agent_dir, exist_ok=True)
        for fname in os.listdir(AGENTS_SOURCE):
            if fname.endswith(".md"):
                shutil.copy2(
                    os.path.join(AGENTS_SOURCE, fname),
                    os.path.join(agent_dir, fname),
                )

    for d in ["tasks", "reviews", "audits", "runs"]:
        os.makedirs(os.path.join(project_dir, d), exist_ok=True)

    opencode_json = {
        "$schema": "https://opencode.ai/config.json",
        "permission": {
            "edit": "allow",
            "bash": "allow",
            "external_directory": "deny",
            "webfetch": "deny",
            "skill": "deny",
            "read": "allow",
            "glob": "allow",
            "grep": "allow",
            "list": "allow",
        },
    }
    with open(os.path.join(project_dir, "opencode.json"), "w") as f:
        json.dump(opencode_json, f, indent=2)

    subprocess.run(
        ["git", "init"],
        cwd=project_dir,
        capture_output=True,
        timeout=10,
    )
    gitignore = os.path.join(project_dir, ".gitignore")
    if not os.path.exists(gitignore):
        with open(gitignore, "w") as f:
            f.write("node_modules/\n.opencode/_prompt_*\ndist/\n.env\n.env.*\n*.tsbuildinfo\ndata/*.db\n")

    base_tmpl = stack_config.get("base_template_dir")
    if base_tmpl and os.path.isdir(base_tmpl):
        for item in os.listdir(base_tmpl):
            s = os.path.join(base_tmpl, item)
            d = os.path.join(project_dir, item)
            if os.path.isdir(s):
                shutil.copytree(s, d, dirs_exist_ok=True)
            else:
                shutil.copy2(s, d)
    elif stack_config.get("id") == "default":
        scaffold_base_codebase(project_dir, task)

    # Pre-install npm deps to save time during AI generation (short timeout — will retry in dev server if needed)
    try:
        npm_exe = "npm.cmd" if sys.platform == "win32" else "npm"
        cache_dir = os.path.abspath(os.path.join(APP_BUILDER_DIR, ".npm-cache"))
        os.makedirs(cache_dir, exist_ok=True)
        subprocess.run(
            [npm_exe, "install", "--prefer-offline", "--no-audit", "--no-fund", "--cache", cache_dir],
            cwd=project_dir,
            capture_output=True,
            timeout=60,
        )
    except subprocess.TimeoutExpired:
        if not os.environ.get("RUNNING_IN_TUI"):
            print(f"  WARNING: background npm install timed out (will retry later)")
    except Exception as e:
        if not os.environ.get("RUNNING_IN_TUI"):
            print(f"  WARNING: background npm install failed to start: {e}")

    return project_dir, slug


def scaffold_base_codebase(project_dir: str, task: str):
    """Scaffold complete, functional Vite+React frontend and Express backend starter base code."""
    fe_dir = os.path.join(project_dir, "frontend")
    be_dir = os.path.join(project_dir, "backend")
    os.makedirs(os.path.join(fe_dir, "src"), exist_ok=True)
    os.makedirs(be_dir, exist_ok=True)

    fe_pkg = {
        "name": "frontend",
        "private": True,
        "version": "0.0.0",
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview",
            "test": "echo \"No tests specified\" && exit 0"
        },
        "dependencies": {
            "react": "^18.3.1",
            "react-dom": "^18.3.1",
            "lucide-react": "^0.469.0"
        },
        "devDependencies": {
            "@vitejs/plugin-react": "^4.3.4",
            "vite": "^5.4.19"
        }
    }
    with open(os.path.join(fe_dir, "package.json"), "w", encoding="utf-8") as f:
        json.dump(fe_pkg, f, indent=2)

    vite_cfg = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
"""
    with open(os.path.join(fe_dir, "vite.config.js"), "w", encoding="utf-8") as f:
        f.write(vite_cfg)

    index_html = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{task.title()} — Starter App</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"""
    with open(os.path.join(fe_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(index_html)

    main_jsx = """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"""
    with open(os.path.join(fe_dir, "src", "main.jsx"), "w", encoding="utf-8") as f:
        f.write(main_jsx)

    app_jsx = f"""import React, {{ useState, useEffect }} from 'react'
import {{ Wallet, ArrowUpRight, ArrowDownLeft, Plus, RefreshCw, Layers, ShieldCheck }} from 'lucide-react'

export default function App() {{
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {{
    fetch('/api/health')
      .then(res => res.json())
      .then(d => {{
        setData(d)
        setLoading(false)
      }})
      .catch(() => setLoading(false))
  }}, [])

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-badge">
          <Wallet className="icon-main" />
          <h1>{task.title()}</h1>
        </div>
        <div className="status-pill">
          <ShieldCheck size={{16}} />
          <span>{{loading ? 'Connecting...' : data ? 'Backend Online' : 'Local Mode'}}</span>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="card hero-card">
          <h2>Overview Dashboard</h2>
          <p className="subtitle">Welcome to your hackathon starter application foundation.</p>
          <div className="metrics-row">
            <div className="metric">
              <span className="label">Status</span>
              <span className="value text-green">Active</span>
            </div>
            <div className="metric">
              <span className="label">Framework</span>
              <span className="value">Vite + React</span>
            </div>
            <div className="metric">
              <span className="label">API Bridge</span>
              <span className="value">Express 4.x</span>
            </div>
          </div>
        </section>

        <section className="card">
          <h3><Layers size={{18}} /> Quick Start Actions</h3>
          <div className="actions-list">
            <button className="btn btn-primary" onClick={{() => alert('Base template initialized successfully!')}}>
              <Plus size={{16}} /> Add Record
            </button>
            <button className="btn btn-secondary" onClick={{() => window.location.reload()}}>
              <RefreshCw size={{16}} /> Refresh Data
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}}
"""
    with open(os.path.join(fe_dir, "src", "App.jsx"), "w", encoding="utf-8") as f:
        f.write(app_jsx)

    index_css = """* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', -apple-system, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; }
.app-container { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; }
.app-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 2rem; border-bottom: 1px solid #1e293b; }
.logo-badge { display: flex; align-items: center; gap: 0.75rem; color: #38bdf8; }
.icon-main { width: 32px; height: 32px; }
.status-pill { display: flex; align-items: center; gap: 0.5rem; background: #1e293b; padding: 0.4rem 0.8rem; border-radius: 9999px; font-size: 0.85rem; color: #94a3b8; }
.dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-top: 2rem; }
.card { background: #1e293b; border-radius: 12px; padding: 1.5rem; border: 1px solid #334155; }
.hero-card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
.subtitle { color: #94a3b8; margin-top: 0.5rem; }
.metrics-row { display: flex; gap: 2rem; margin-top: 1.5rem; }
.metric { display: flex; flex-direction: column; }
.metric .label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; }
.metric .value { font-size: 1.25rem; font-weight: 600; margin-top: 0.25rem; }
.text-green { color: #4ade80; }
.actions-list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
.btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; border-radius: 8px; font-weight: 500; border: none; cursor: pointer; transition: opacity 0.2s; }
.btn-primary { background: #0284c7; color: white; }
.btn-secondary { background: #334155; color: white; }
.btn:hover { opacity: 0.9; }
"""
    with open(os.path.join(fe_dir, "src", "index.css"), "w", encoding="utf-8") as f:
        f.write(index_css)

    with open(os.path.join(fe_dir, ".gitignore"), "w", encoding="utf-8") as f:
        f.write("node_modules/\ndist/\n.env\n")

    be_pkg = {
        "name": "backend",
        "version": "1.0.0",
        "description": "API Server",
        "main": "server.js",
        "scripts": {
            "start": "node server.js",
            "dev": "node server.js",
            "build": "node --check server.js",
            "test": "echo \"No tests specified\" && exit 0"
        },
        "dependencies": {
            "cors": "^2.8.5",
            "dotenv": "^16.4.7",
            "express": "^4.21.2"
        }
    }
    with open(os.path.join(be_dir, "package.json"), "w", encoding="utf-8") as f:
        json.dump(be_pkg, f, indent=2)

    be_server = f"""const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT_BACKEND || process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {{
  res.json({{ status: 'ok', app: '{task}', timestamp: new Date().toISOString() }});
}});

app.get('/api/data', (req, res) => {{
  res.json({{
    message: 'Base API data loaded successfully',
    items: [
      {{ id: 1, title: 'Sample Transaction 1', amount: 1500, type: 'credit' }},
      {{ id: 2, title: 'Sample Expense 2', amount: 450, type: 'debit' }}
    ]
  }});
}});

const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {{
  if (!req.path.startsWith('/api')) {{
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {{
      if (err) {{
        res.status(200).send('<h2>API Server Running. Frontend dist not built yet.</h2>');
      }}
    }});
  }}
}});

app.listen(PORT, () => {{
  console.log(`Backend API server running on http://localhost:${{PORT}}`);
}});
"""
    with open(os.path.join(be_dir, "server.js"), "w", encoding="utf-8") as f:
        f.write(be_server)

    with open(os.path.join(be_dir, ".gitignore"), "w", encoding="utf-8") as f:
        f.write("node_modules/\n.env\n*.db\n")


def copy_agents(project_dir: str):
    for agent_dir in [
        os.path.join(project_dir, ".opencode", "agent"),
        os.path.join(project_dir, ".opencode", "agents"),
        os.path.join(project_dir, "agents"),
    ]:
        os.makedirs(agent_dir, exist_ok=True)
        for fname in os.listdir(AGENTS_SOURCE):
            if fname.endswith(".md"):
                shutil.copy2(
                    os.path.join(AGENTS_SOURCE, fname),
                    os.path.join(agent_dir, fname),
                )


def _has_changes(project_dir: str) -> bool:
    try:
        r = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=project_dir,
            capture_output=True,
            timeout=10,
        )
        if r.returncode != 0:
            return True
        out = r.stdout.decode(errors="replace").strip()
        # Filter out node_modules entries
        lines = [line for line in out.splitlines() if "node_modules" not in line]
        return bool(lines)
    except Exception:
        return True


def git_commit(project_dir: str, message: str):
    try:
        if not _has_changes(project_dir):
            return
        r = subprocess.run(
            ["git", "add", "-A"],
            cwd=project_dir,
            capture_output=True,
            timeout=10,
        )
        r = subprocess.run(
            ["git", "commit", "-m", message],
            cwd=project_dir,
            capture_output=True,
            timeout=10,
        )
        if r.returncode != 0 and r.stderr:
            stderr = r.stderr.decode(errors="replace")[:200]
            if not os.environ.get("RUNNING_IN_TUI"):
                print(f"  WARNING: git commit failed: {stderr}", flush=True)
    except Exception as e:
        if not os.environ.get("RUNNING_IN_TUI"):
            print(f"  WARNING: git commit exception: {e}", flush=True)


def _run_npm_script(project_dir: str, script: str, timeout: int) -> dict | None:
    pkg_path = os.path.join(project_dir, "package.json")
    if not os.path.exists(pkg_path):
        return None
    try:
        with open(pkg_path, encoding="utf-8") as f:
            pkg = json.load(f)
        if script not in pkg.get("scripts", {}):
            return None
    except (json.JSONDecodeError, OSError):
        return None
    try:
        r = subprocess.run(
            ["npm", "run", script],
            cwd=project_dir,
            capture_output=True, text=True, timeout=timeout,
        )
        return {
            "exit_code": r.returncode,
            "stdout": r.stdout[-1500:] if len(r.stdout) > 1500 else r.stdout,
            "stderr": r.stderr[-500:] if len(r.stderr) > 500 else r.stderr,
        }
    except subprocess.TimeoutExpired:
        return {"exit_code": -1, "stdout": "", "stderr": "TIMEOUT"}
    except FileNotFoundError:
        return {"exit_code": -1, "stdout": "", "stderr": "npm not found"}


def run_lint_and_test(project_dir: str) -> dict:
    """Run npm run lint and npm run test in root, frontend/, and backend/ in parallel."""
    import concurrent.futures
    result = {"lint": None, "test": None, "build": None}
    subdirs = [project_dir]
    for sub in ["frontend", "backend"]:
        sp = os.path.join(project_dir, sub)
        if os.path.isdir(sp):
            subdirs.append(sp)

    all_lint = []
    all_test = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(subdirs)) as pool:
        lint_futures = {pool.submit(_run_npm_script, d, "lint", 60): d for d in subdirs}
        test_futures = {pool.submit(_run_npm_script, d, "test", 120): d for d in subdirs}
        for fut in concurrent.futures.as_completed(lint_futures):
            d = lint_futures[fut]
            res = fut.result()
            if res is not None:
                all_lint.append((d, res))
        for fut in concurrent.futures.as_completed(test_futures):
            d = test_futures[fut]
            res = fut.result()
            if res is not None:
                all_test.append((d, res))

    if not all_lint:
        result["lint"] = {"exit_code": -1, "stdout": "", "stderr": "no lint script found in any subproject"}
    else:
        worst = max(lr["exit_code"] for _d, lr in all_lint)
        combined_stdout = "\n".join(
            f"[{os.path.basename(d)}]\n{lr['stdout']}" for d, lr in all_lint
        )
        combined_stderr = "\n".join(
            f"[{os.path.basename(d)}]\n{lr['stderr']}" for d, lr in all_lint
        )
        result["lint"] = {
            "exit_code": worst,
            "stdout": combined_stdout[-1500:] if len(combined_stdout) > 1500 else combined_stdout,
            "stderr": combined_stderr[-500:] if len(combined_stderr) > 500 else combined_stderr,
        }

    if not all_test:
        result["test"] = {"exit_code": -1, "stdout": "", "stderr": "no test script found in any subproject"}
    else:
        worst = max(tr["exit_code"] for _d, tr in all_test)
        combined_stdout = "\n".join(
            f"[{os.path.basename(d)}]\n{tr['stdout']}" for d, tr in all_test
        )
        combined_stderr = "\n".join(
            f"[{os.path.basename(d)}]\n{tr['stderr']}" for d, tr in all_test
        )
        result["test"] = {
            "exit_code": worst,
            "stdout": combined_stdout[-1500:] if len(combined_stdout) > 1500 else combined_stdout,
            "stderr": combined_stderr[-500:] if len(combined_stderr) > 500 else combined_stderr,
        }

    return result


def _escape_template(s: str) -> str:
    if not isinstance(s, str):
        return s
    return s.replace("$", "$$")


def estimate_tokens(text: str, model: str = "cl100k_base") -> int:
    if HAS_TIKTOKEN:
        try:
            enc = tiktoken.get_encoding(model)
            return len(enc.encode(text))
        except Exception:
            pass
    # Rough estimate: ~4 chars per token
    return len(text) // 4


def truncate_to_limit(text: str, max_tokens: int = 128000, model: str = "cl100k_base") -> str:
    tokens = estimate_tokens(text, model)
    if tokens <= max_tokens:
        return text
    ratio = max_tokens / tokens
    target_chars = int(len(text) * ratio * 0.9)
    return text[:target_chars] + f"\n\n... (truncated from ~{tokens} tokens to ~{max_tokens})"


def _jinja_escape_code(s: str) -> str:
    if not isinstance(s, str):
        return s
    return s.replace("$", "&#36;").replace("`", "\\`")


def _build_jinja_env() -> jinja2.Environment:
    env = jinja2.Environment(autoescape=False)
    env.filters["escape_code"] = _jinja_escape_code
    return env


# Default max context for model — will auto-truncate prompts exceeding 80% of this
DEFAULT_MAX_CONTEXT_TOKENS = 128000


def load_prompt(name: str, /, max_tokens: int = DEFAULT_MAX_CONTEXT_TOKENS, **kwargs) -> str:
    path = os.path.join(PROMPTS_SOURCE, name)
    with open(path, encoding="utf-8") as f:
        text = f.read()
    if kwargs:
        if HAS_JINJA2 and ("{{" in text or "{%" in text):
            jinja_env = _build_jinja_env()
            jinja_template = jinja_env.from_string(text)
            text = jinja_template.render(**kwargs)
        else:
            escaped = {k: _escape_template(v) for k, v in kwargs.items()}
            try:
                text = Template(text).substitute(**escaped)
            except (KeyError, ValueError) as e:
                if HAS_JINJA2:
                    jinja_env = _build_jinja_env()
                    jinja_template = jinja_env.from_string(text)
                    text = jinja_template.render(**kwargs)
                else:
                    raise e
    # Auto-truncate if over 80% of context budget
    budget = int(max_tokens * 0.8)
    text = truncate_to_limit(text, max_tokens=budget)
    return text
