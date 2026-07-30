# Architecture — Todo List App

## 1. System Overview

```
┌─────────────────────────────────────────────────┐
│                   Browser                         │
│  ┌───────────────────────────────────────────┐   │
│  │         React 18 + Vite (SPA)             │   │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐  │   │
│  │  │ App.jsx  │ │TodoList  │ │ AddTodo   │  │   │
│  │  │ (Shell)  │ │Component │ │ Component │  │   │
│  │  └────┬────┘ └────┬─────┘ └─────┬─────┘  │   │
│  │       └───────────┼──────────────┘         │   │
│  │                   │ fetch() / axios         │   │
│  └───────────────────┼─────────────────────────┘   │
│                      │                              │
└──────────────────────┼──────────────────────────────┘
                       │  HTTP (localhost:5173)
              ┌────────┴────────┐
              │  Vite Proxy     │  /api/* → localhost:3001
              └────────┬────────┘
                       │
┌──────────────────────┼──────────────────────────────┐
│          Express 4.x (API Server)                   │
│  ┌─────────────────────────────────────────────┐    │
│  │  GET    /api/todos     — list all           │    │
│  │  POST   /api/todos     — create todo        │    │
│  │  PUT    /api/todos/:id — update todo        │    │
│  │  DELETE /api/todos/:id — delete todo        │    │
│  │  PATCH  /api/todos/:id/toggle — toggle done │    │
│  └──────────────────────┬──────────────────────┘    │
│                         │                            │
│  ┌──────────────────────┴──────────────────────┐    │
│  │  better-sqlite3 (SQLite)                    │    │
│  │  File: ./data/todos.db                      │    │
│  │  Table: todos                               │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 18.x |
| Build Tool | Vite | 5.x |
| Icons | lucide-react | 0.469.x |
| HTTP Client | fetch (native) | — |
| Backend Runtime | Node.js | 18+ |
| API Framework | Express | 4.x |
| Database | SQLite (better-sqlite3) | latest |
| CORS | cors middleware | ^2.8.5 |
| Env Config | dotenv | ^16.4.7 |

---

## 3. Database Schema

### Table: `todos`

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | — | Unique identifier |
| `title` | TEXT | NOT NULL | — | Task description |
| `completed` | INTEGER | NOT NULL DEFAULT 0 | 0 | 0 = pending, 1 = done |
| `created_at` | TEXT | NOT NULL | CURRENT_TIMESTAMP | ISO 8601 string |
| `updated_at` | TEXT | NOT NULL | CURRENT_TIMESTAMP | ISO 8601 string |

```sql
CREATE TABLE IF NOT EXISTS todos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT    NOT NULL,
  completed  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

### Index

```sql
CREATE INDEX idx_todos_completed ON todos(completed);
```

---

## 4. API Specification

### Base URL

- Development: `http://localhost:3001/api`
- With Vite proxy: `/api` (from frontend)

### Endpoints

#### `GET /api/todos`

List all todos, newest first.

**Response `200`**
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "completed": 0,
    "created_at": "2026-07-30T10:00:00.000Z",
    "updated_at": "2026-07-30T10:00:00.000Z"
  }
]
```

#### `POST /api/todos`

Create a new todo.

**Request Body**
```json
{
  "title": "Buy groceries"
}
```

**Response `201`**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "completed": 0,
  "created_at": "2026-07-30T10:00:00.000Z",
  "updated_at": "2026-07-30T10:00:00.000Z"
}
```

**Errors**

| Status | Condition |
|--------|-----------|
| 400 | `title` missing, empty, or too long (>200 chars) |

#### `PUT /api/todos/:id`

Update a todo's title.

**Request Body**
```json
{
  "title": "Buy organic groceries"
}
```

**Response `200`** — Updated todo object.

**Errors**

| Status | Condition |
|--------|-----------|
| 400 | `title` missing or empty |
| 404 | Todo with `:id` does not exist |

#### `PATCH /api/todos/:id/toggle`

Toggle the `completed` status of a todo.

**Response `200`**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "completed": 1,
  "created_at": "...",
  "updated_at": "..."
}
```

**Errors**

| Status | Condition |
|--------|-----------|
| 404 | Todo with `:id` does not exist |

#### `DELETE /api/todos/:id`

Delete a todo.

**Response `200`**
```json
{
  "message": "Todo deleted"
}
```

**Errors**

| Status | Condition |
|--------|-----------|
| 404 | Todo with `:id` does not exist |

---

## 5. Data Flow

```
User types task → Clicks "Add"
  └─→ Frontend validates (non-empty, ≤200 chars)
      └─→ POST /api/todos  { title }
          └─→ Server inserts row in SQLite
              └─→ Returns 201 + todo object
                  └─→ Frontend prepends to list

User clicks checkbox
  └─→ PATCH /api/todos/:id/toggle
      └─→ Server flips completed bit
          └─→ Returns updated todo
              └─→ Frontend updates state

User clicks delete icon
  └─→ DELETE /api/todos/:id
      └─→ Server removes row
          └─→ Frontend removes from list
```

---

## 6. Security Considerations

| Area | Practice |
|------|----------|
| Input validation | Server rejects empty titles, enforces max length 200 |
| SQL injection | Prevented by better-sqlite3 prepared statements (`?` placeholders) |
| CORS | `cors()` allows all origins in dev; restrict in production |
| XSS | React's JSX auto-escapes output; never use `dangerouslySetInnerHTML` |
| Rate limiting | Not implemented for MVP; add `express-rate-limit` for production |
| HTTPS | Not configured in dev; use a reverse proxy (Nginx/Caddy) in prod |
| Environment | `dotenv` loads `.env`; never commit secrets |

---

## 7. Folder Structure (after building)

```
/
├── backend/
│   ├── server.js          ← Express app, routes, DB init
│   ├── package.json
│   ├── .gitignore
│   └── data/              ← SQLite DB files (gitignored)
│       └── todos.db
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx       ← React entry point
│       ├── App.jsx        ← Root component, state holder
│       ├── App.css        ← Global styles
│       └── components/
│           ├── TodoList.jsx
│           ├── TodoItem.jsx
│           └── AddTodo.jsx
├── ARCHITECTURE.md
├── WALKTHROUGH.md
├── NEXT-STEPS.md
├── HACKATHON.md
└── tasks/
    ├── frontend-task.md
    └── backend-task.md
```

---

## 8. Error Handling Strategy

- **Server**: All errors caught by a global Express error middleware; returns `{ error: "message" }` with appropriate status code.
- **Client**: Each `fetch` call handles non-2xx responses; shows a toast or inline error message.
- **Network**: If the backend is unreachable, the UI shows "Backend offline — running in demo mode" with mock data.
