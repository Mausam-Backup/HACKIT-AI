# Todo List — Tasks

> Flat, trackable task list. Check off as you complete each item.

---

## Backend (Express + SQLite)

- [ ] `backend/package.json` — Add `better-sqlite3` dependency
- [ ] `backend/server.js` — Require and initialize better-sqlite3, create `data/` directory
- [ ] `backend/server.js` — Create `todos` table via `CREATE TABLE IF NOT EXISTS` on startup
- [ ] `backend/server.js` — Implement `GET /api/todos` — return all todos, optional ?completed filter
- [ ] `backend/server.js` — Implement `POST /api/todos` — accept `{ title }`, insert row, return 201 + new todo
- [ ] `backend/server.js` — Implement `PATCH /api/todos/:id` — toggle `completed` or update `title`, return updated todo
- [ ] `backend/server.js` — Implement `DELETE /api/todos/:id` — delete row, return 204
- [ ] `backend/server.js` — Add input validation (title required, non-empty string, max 200 chars)
- [ ] `backend/server.js` — Remove old `/api/data` and `/api/health` sample endpoints (or keep health)

## Frontend (React + Vite)

- [ ] `frontend/src/App.jsx` — Replace boilerplate with Todo List app
- [ ] `frontend/src/App.jsx` — Add `useState` for `todos` array, `newTodo` text, `loading` flag
- [ ] `frontend/src/App.jsx` — `useEffect` to `GET /api/todos` on mount
- [ ] `frontend/src/App.jsx` — Render todo items: checkbox (completed), title text, delete button
- [ ] `frontend/src/App.jsx` — Add todo form: text input + "Add" button, calls `POST /api/todos`
- [ ] `frontend/src/App.jsx` — Toggle completion: `PATCH /api/todos/:id` with `{ completed: !current }`
- [ ] `frontend/src/App.jsx` — Delete todo: `DELETE /api/todos/:id`, remove from local state
- [ ] `frontend/src/App.jsx` — Loading spinner / "No todos yet" empty state
- [ ] `frontend/src/App.css` — Style everything: clean, minimal, mobile-friendly
- [ ] `frontend/index.html` — Update `<title>` to "Todo List"

## Cross-cutting

- [ ] Backend + frontend communicate correctly via proxy (`/api` → `localhost:3001`)
- [ ] App works end-to-end: add → see in list → toggle → delete → refresh persists

## Stretch (if time permits)

- [ ] Inline edit todo title (double-click to edit)
- [ ] Filter tabs: All / Active / Completed
- [ ] Search input to filter by title text
- [ ] Due date with `<input type="date">`
- [ ] Keyboard shortcut: Enter to add, Escape to blur
