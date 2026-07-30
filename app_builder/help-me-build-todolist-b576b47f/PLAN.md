# Todo List — Project Plan

## Problem
Users need a simple, fast, and reliable way to track daily tasks. Existing solutions are either bloated (notion, trello) or require sign-up. This app provides a zero-friction, single-user todo list that Just Works™ — no accounts, no clutter.

## Target Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18.x + Vite 5.x |
| Styling | Plain CSS (no framework) |
| Icons | lucide-react |
| Backend | Node.js / Express 4.x |
| Database | SQLite via better-sqlite3 |
| API Style | REST (JSON) |

## MVP Features (must-have)
1. **Create** a new todo with a title (and optional description)
2. **Read / List** all todos (sorted by newest first)
3. **Toggle** a todo's completion status (checkbox)
4. **Delete** a single todo
5. **Persistence** — todos survive server restarts (SQLite)

## Stretch Goals (if time permits)
- Inline edit of todo title
- Due date picker
- Filter: All / Active / Completed
- Search / filter by title text
- Keyboard shortcuts (Enter to add, Escape to cancel)

## API Plan
All endpoints are prefixed with `/api/todos`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/todos       | List all todos (query: ?completed=true/false) |
| POST   | /api/todos       | Create a new todo |
| PATCH  | /api/todos/:id   | Update a todo (toggle complete or edit title) |
| DELETE | /api/todos/:id   | Delete a todo |

Full request/response schema documented in `api-contract.json`.

## Database Plan
**File:** `backend/data/todos.db` (auto-created)

### Table: `todos`
| Column    | Type     | Constraints |
|-----------|----------|-------------|
| id        | INTEGER  | PRIMARY KEY AUTOINCREMENT |
| title     | TEXT     | NOT NULL |
| completed | INTEGER  | NOT NULL DEFAULT 0 (0=false, 1=true) |
| created_at| TEXT     | DEFAULT (datetime('now')) |

No migrations framework — the `server.js` will run `CREATE TABLE IF NOT EXISTS` on startup.

## Data Flow
```
User clicks "Add"  →  React state updates  →  POST /api/todos
                                          →  Express validates  →  SQLite INSERT
                                          →  Returns new todo JSON  →  React re-renders list
```

## Risks & Mitigations
| Risk | Mitigation |
|------|-----------|
| SQLite file locking on concurrent writes | Single-process Express (fine for hackathon) |
| CORS mismatch between Vite dev server and Express | Vite proxy config already in place (`/api` → `localhost:3001`) |
| No auth means data is public on LAN | Acceptable for hackathon; document as known limitation |
| Frontend stale data after mutation | Re-fetch full list on every mutation (simple, works) |
