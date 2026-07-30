# Walkthrough — Todo List App

## 1. File Directory Map

```
E:\SCOF\app_builder\help-me-build-todolist-b576b47f
│
├── backend/
│   ├── server.js              ← Express API + SQLite init
│   ├── package.json
│   ├── .gitignore
│   └── data/                  ← Created at runtime
│       └── todos.db           ← SQLite database (gitignored)
│
├── frontend/
│   ├── index.html             ← Vite entry HTML
│   ├── vite.config.js         ← Dev server + proxy config
│   ├── package.json
│   └── src/
│       ├── main.jsx           ← React DOM entry
│       ├── App.jsx            ← Root component, state, data fetching
│       ├── App.css            ← All application styles
│       └── components/
│           ├── AddTodo.jsx    ← Input form for new todos
│           ├── TodoList.jsx   ← Renders the list of todos
│           └── TodoItem.jsx   ← Single todo row with checkbox + delete
│
├── ARCHITECTURE.md            ← System design, API, schema, security
├── WALKTHROUGH.md             ← This file — setup + test instructions
├── NEXT-STEPS.md              ← Prompt chain for incremental building
├── HACKATHON.md               ← Demo script + pitch guide
│
└── tasks/
    ├── frontend-task.md       ← Build spec for frontend builder agent
    └── backend-task.md        ← Build spec for backend builder agent
```

---

## 2. Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (ships with Node)
- A terminal (PowerShell, CMD, bash, etc.)

Check your versions:

```bash
node --version   # e.g., v18.20.0
npm --version    # e.g., 10.5.0
```

---

## 3. Setup Runbook

### Step 1 — Install backend dependencies

```bash
cd backend
npm install
```

This installs `express`, `cors`, `dotenv`, and `better-sqlite3`.

### Step 2 — Install frontend dependencies

```bash
cd ../frontend
npm install
```

This installs `react`, `react-dom`, `lucide-react`, `vite`, and the Vite React plugin.

### Step 3 — Start the backend server (terminal 1)

```bash
cd backend
node server.js
```

Expected output:

```
Backend API server running on http://localhost:3001
SQLite database initialized at ./data/todos.db
```

Verify the health endpoint (open a second terminal):

```bash
curl http://localhost:3001/api/health
# → {"status":"ok","app":"Todo List API","timestamp":"..."}
```

### Step 4 — Start the frontend dev server (terminal 2)

```bash
cd frontend
npm run dev
```

Expected output:

```
VITE v5.x  ready in 200ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 5 — Open the app

Visit **http://localhost:5173/** in your browser.

You should see:

- A header with "Todo List" title and a "Backend Online" status pill
- An input box to add new todos
- A list of existing todos (initially empty or with seed data)

---

## 4. Manual Test Steps

### 4.1 — Add a Todo

1. Type `Buy groceries` in the input field.
2. Press Enter or click the **Add** button.
3. **Expected**: The todo appears in the list with an unchecked checkbox.

### 4.2 — Add another todo

1. Type `Walk the dog`.
2. Press Enter.
3. **Expected**: Both todos are visible. Newest appears at the top.

### 4.3 — Toggle a todo (mark as done)

1. Click the checkbox next to "Buy groceries".
2. **Expected**: Checkbox becomes checked, text is line-through styled.

### 4.4 — Toggle back (mark as pending)

1. Click the same checkbox again.
2. **Expected**: Checkbox becomes unchecked, line-through removed.

### 4.5 — Delete a todo

1. Click the trash icon (or × button) on "Walk the dog".
2. **Expected**: The todo is removed from the list.

### 4.6 — Validation — empty title

1. Click **Add** without typing anything.
2. **Expected**: An error message appears: "Title is required."

### 4.7 — Validation — title too long

1. Paste a string longer than 200 characters and click **Add**.
2. **Expected**: An error message appears: "Title must be 200 characters or fewer."

### 4.8 — Backend offline resilience

1. Stop the backend server (Ctrl+C in terminal 1).
2. Refresh the frontend.
3. **Expected**: The status pill shows "Backend Offline" and a friendly message appears. The UI may show demo/mock data or an error state.

### 4.9 — API direct test (via curl)

```bash
# List todos
curl http://localhost:3001/api/todos

# Create a todo
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test from curl"}'

# Toggle todo with id=1
curl -X PATCH http://localhost:3001/api/todos/1/toggle

# Update todo with id=1
curl -X PUT http://localhost:3001/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title"}'

# Delete todo with id=1
curl -X DELETE http://localhost:3001/api/todos/1
```

---

## 5. Common Issues & Fixes

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `Cannot find module 'better-sqlite3'` | Dependencies not installed | Run `npm install` in `backend/` |
| `Address already in use :::3001` | Backend already running or port in use | Kill the process or change `PORT_BACKEND` in `.env` |
| Frontend shows "Backend Offline" | Backend not started | Start backend with `node backend/server.js` |
| Proxy errors in browser console | Vite proxy misconfigured | Ensure `vite.config.js` has `/api` → `localhost:3001` |
| SQLite `data/` folder missing | Auto-created by server.js | Manually create `backend/data/` if issue persists |
| `node-gyp` build errors (Windows) | Missing build tools | Run `npm install --global windows-build-tools` or use `@jitl/quickjs-singlefile` alternative |

---

## 6. Running in Production

```bash
# Build frontend
cd frontend
npm run build   # outputs to frontend/dist/

# Serve via backend (which static-serves dist/)
cd ../backend
node server.js

# Access at http://localhost:3001
```

The backend automatically serves the built frontend files from `frontend/dist/`.
