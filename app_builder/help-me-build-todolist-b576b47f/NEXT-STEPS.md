# Next Steps — Build & Extend the Todo List App

This file contains a series-by-series prompt chain. Each **Series** is a self-contained set of instructions you (or an AI builder agent) can follow to incrementally build or extend the project. Complete them in order.

---

## Series 1 — Project Scaffold & Backend Setup

**Goal**: Initialize the Express backend with SQLite and the todos CRUD API.

### Prompt

```
You are building the backend for a Todo List app.

Tech stack: Node.js, Express 4.x, better-sqlite3 (SQLite).

Directory: ./backend/

Files to create/modify:

1. ./backend/package.json — must include dependencies: express, cors, dotenv, better-sqlite3.
2. ./backend/server.js — Express app that:
   - Uses cors(), express.json()
   - Reads PORT from env (process.env.PORT_BACKEND or 3001)
   - Initializes SQLite database at ./data/todos.db (create ./data/ folder if missing)
   - Creates a `todos` table on startup:
     CREATE TABLE IF NOT EXISTS todos (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       title TEXT NOT NULL,
       completed INTEGER NOT NULL DEFAULT 0,
       created_at TEXT NOT NULL DEFAULT (datetime('now')),
       updated_at TEXT NOT NULL DEFAULT (datetime('now'))
     );
   - Implements these API routes on /api:
     GET    /api/todos       — SELECT * FROM todos ORDER BY created_at DESC
     POST   /api/todos       — INSERT INTO todos (title) VALUES (?)
                              Validate: title required, non-empty, max 200 chars.
                              Return 201 with the created todo object.
     PUT    /api/todos/:id   — UPDATE todos SET title=?, updated_at=datetime('now') WHERE id=?
                              Validate: title required, non-empty.
                              Return 404 if not found.
     PATCH  /api/todos/:id/toggle — UPDATE todos SET completed = 1 - completed, updated_at=datetime('now') WHERE id=?
                              Return 404 if not found.
     DELETE /api/todos/:id   — DELETE FROM todos WHERE id=?
                              Return 404 if not found, else { message: "Todo deleted" }
   - Adds a GET /api/health endpoint returning { status: "ok", app: "Todo List API", timestamp: ... }
   - Serves static files from ../frontend/dist/ (fallback to index.html for non-API routes)
   - Global error handler middleware that returns { error: message }
3. ./.env (if exists) or defaults — PORT_BACKEND=3001
4. ./backend/.gitignore — node_modules/ and data/

Verify: Run `node server.js` and test all endpoints with curl.
```

**Deliverable**: A fully functional REST API for todos.

---

## Series 2 — Frontend Bootstrap & Todo List UI

**Goal**: Build the React frontend with Vite, create core components, and connect to the API.

### Prompt

```
You are building the frontend for a Todo List app.

Tech stack: React 18, Vite 5, lucide-react icons.

Directory: ./frontend/

Files to create/modify:

1. ./frontend/package.json — dependencies: react, react-dom, lucide-react.
   DevDependencies: @vitejs/plugin-react, vite.
   Scripts: dev, build, preview.

2. ./frontend/vite.config.js — React plugin, dev server on port 5173, proxy /api → http://localhost:3001

3. ./frontend/index.html — Standard Vite HTML with <div id="root"> and <script type="module" src="/src/main.jsx">

4. ./frontend/src/main.jsx — Render <App /> into #root with StrictMode.

5. ./frontend/src/App.jsx — Root component:
   - State: todos (array), loading (bool), error (string|null)
   - On mount: fetch GET /api/todos, handle errors gracefully
   - Renders: Header with "Todo List" title + status pill (Backend Online/Offline)
   - Renders: <AddTodo onAdd={handleAdd} />
   - Renders: <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
   - handleAdd(title): POST /api/todos, prepend result to list
   - handleToggle(id): PATCH /api/todos/:id/toggle, update item in list
   - handleDelete(id): DELETE /api/todos/:id, remove from list

6. ./frontend/src/App.css — Full app styling:
   - Dark theme (background #0f172a, cards #1e293b, text #f8fafc)
   - Clean, centered layout, max-width 640px
   - Styled input + button row
   - Styled todo items with hover effects
   - Checkbox and delete icon styling
   - Loading spinner and error message styles

7. ./frontend/src/components/AddTodo.jsx
   - Controlled input + "Add" button (lucide-react Plus icon)
   - Validation: empty or >200 chars shows inline error
   - On submit: calls props.onAdd(title), clears input, handles errors

8. ./frontend/src/components/TodoList.jsx
   - Receives todos array
   - Maps over items rendering <TodoItem key={todo.id} ... />
   - Shows "No todos yet" empty state when array is empty

9. ./frontend/src/components/TodoItem.jsx
   - Renders a single todo row
   - Checkbox (custom styled) that calls onToggle(id)
   - Title text with line-through when completed
   - Delete button (Trash2 icon from lucide-react)
   - Animates on mount (CSS transition)

Verify: Run frontend with backend running. Add, toggle, and delete todos in the browser.
```

**Deliverable**: A fully functional, styled Todo List SPA connected to the backend.

---

## Series 3 — Error Handling & UX Polish

**Goal**: Improve error handling, loading states, and empty states.

### Prompt

```
Enhance the Todo List app with robust error handling and polish.

1. Frontend (App.jsx):
   - Add a Toast/notification component that shows success and error messages for each action.
   - Auto-dismiss toasts after 3 seconds.
   - Disable Add button while request is in-flight (add a submitting state).
   - Show a subtle loading skeleton (animated placeholder) while initial fetch is loading.
   - If backend is unreachable, show an inline banner: "Backend offline — running in demo mode" and populate with 2 sample todos (client-side only).

2. Backend (server.js):
   - Add request logging middleware (method, url, status, duration).
   - Return structured error responses: { error: string, details?: any }
   - Handle invalid JSON body (malformed JSON) → 400.
   - Handle non-numeric :id params → 400.
   - Ensure database errors bubble to the global error handler.

3. General:
   - Commit all changes with descriptive messages.
   - Test edge cases: double-click add, rapid toggles, deleting non-existent items.
```

**Deliverable**: Polished UX with toasts, loading states, and defensive backend.

---

## Series 4 — Filtering & Search

**Goal**: Add ability to filter todos by status and search by keyword.

### Prompt

```
Add filtering and search to the Todo List app.

1. Frontend:
   - Add a filter bar above the todo list with three buttons: "All" | "Active" | "Completed"
   - The active filter is visually highlighted.
   - Filtering is done client-side (no new API calls).
   - Add a search input that filters todos by title (case-insensitive, substring match).
   - Search and filter work together (e.g., "Active" + search "groceries" shows only active todos matching "groceries").
   - Show a count: "Showing 3 of 8 todos"

2. Backend:
   - Add query params to GET /api/todos?completed=0|1&search=keyword
   - Support SQL WHERE clauses:
     - ?completed=0 → WHERE completed = 0
     - ?completed=1 → WHERE completed = 1
     - ?search=groceries → WHERE title LIKE '%groceries%'
   - Combine both: ?completed=0&search=milk

3. Frontend:
   - Pass filter params to the API on initial load (so large lists are filtered server-side).
   - Keep client-side filtering for instant UX after data is loaded.

Verify: Type in search box, toggle filters, confirm both work together.
```

**Deliverable**: Search + filter by status with server-side query support.

---

## Series 5 — Due Dates & Priority

**Goal**: Add optional due dates and priority levels to todos.

### Prompt

```
Extend the Todo model with due dates and priority.

1. Database migration (backend):
   - Add columns to todos table:
     due_date TEXT (nullable, ISO date string YYYY-MM-DD)
     priority TEXT NOT NULL DEFAULT 'medium' — values: 'low', 'medium', 'high'
   - Since SQLite doesn't support ALTER TABLE ADD COLUMN with IF NOT EXISTS easily, write a migration helper that checks for column existence via PRAGMA table_info(todos).

2. API changes:
   - POST /api/todos accepts optional due_date and priority (default 'medium').
   - PUT /api/todos/:id accepts optional due_date and priority.
   - GET /api/todos returns new fields.
   - Add GET /api/todos?priority=high filter.

3. Frontend:
   - AddTodo component: Add optional date input and priority dropdown (Low / Medium / High).
   - TodoItem: Show due date (formatted, red if overdue), priority badge (colored).
   - TodoList: Add sorting options: by date (newest), by priority (high first), by due date (soonest).
   - Style priority badges with colors: low=green, medium=yellow, high=red.

Verify: Create todos with different priorities and dates, verify sorting and overdue highlighting.
```

**Deliverable**: Todos with due dates, priority levels, sorting, and overdue warnings.

---

## Series 6 — Persist Theme & Local Preferences

**Goal**: Save user preferences (theme, filter) to localStorage.

### Prompt

```
Add localStorage persistence for user preferences.

1. Frontend:
   - Save the active filter (All/Active/Completed) to localStorage key 'todo-filter'.
   - Restore it on page reload.
   - Save the search query to sessionStorage (doesn't persist across tabs).
   - Add a "Clear completed" button that deletes all completed todos (sends one DELETE request per item or a new batch endpoint).
   - Add a todo count in the header: "5 items left" (number of active todos).

2. Backend:
   - Add DELETE /api/todos/completed — deletes all todos WHERE completed = 1.
   - Returns { deletedCount: number }.

Verify: Reload the page — filter state is restored. "Clear completed" works.
```

**Deliverable**: Persistent filter preference and batch delete for completed items.

---

## Series 7 — Keyboard Shortcuts & Accessibility

**Goal**: Make the app more accessible and power-user friendly.

### Prompt

```
Improve accessibility and add keyboard shortcuts.

1. Accessibility:
   - All inputs have proper <label> elements (screen-reader friendly).
   - Todo list is wrapped in <ul> with <li> items.
   - Add aria-labels to buttons and icons.
   - Focus management: after adding a todo, focus returns to the input.
   - Checkbox uses <input type="checkbox"> (not a div) for native a11y.
   - Add role="status" to toast notifications.
   - Ensure color contrast ratios meet WCAG AA (use tools like WebAIM).

2. Keyboard shortcuts:
   - Ctrl+N or Alt+N → Focus the add-todo input.
   - Ctrl+D or Alt+D → Focus the search input.
   - Escape → Clear search / close any open state.
   - Tab navigation order is logical.

Verify: Tab through the entire UI. Use keyboard shortcuts. Test with a screen reader (VoiceOver/NVDA).
```

**Deliverable**: Accessible, keyboard-navigable todo app.

---

## Series 8 — Deployment Preparation

**Goal**: Prepare the app for deployment to a platform like Render, Railway, or Fly.io.

### Prompt

```
Prepare the Todo List app for production deployment.

1. Backend:
   - Add a start script in package.json: "start": "node server.js"
   - Ensure the server respects PORT env var (already done).
   - Add a health check at GET /api/health.
   - Ensure SQLite DB path uses an absolute path or a path relative to project root (so it works in ephemeral filesystems).
   - Add a .env.example file (do not commit real .env).

2. Frontend:
   - Add "build" script (already exists).
   - Ensure Vite's build output goes to ../backend/dist/ or configure backend to serve from a known path.
   - Add a "preview" script to test production build locally.

3. Root:
   - Create a root package.json with convenience scripts:
     "scripts": {
       "install:all": "cd backend && npm install && cd ../frontend && npm install",
       "dev:backend": "cd backend && node server.js",
       "dev:frontend": "cd frontend && npm run dev",
       "build": "cd frontend && npm run build",
       "start": "cd backend && node server.js"
     }
   - Add a Render/Railway deploy config or a Dockerfile:
     - Dockerfile that copies both frontend and backend, runs build, and starts server.

4. Documentation:
   - Update README with deployment instructions.
   - Add a section on environment variables.

Verify: Run `npm run build` then `npm start`, access app at localhost:3001 — everything works.
```

**Deliverable**: Production-ready app with Dockerfile and deployment docs.
