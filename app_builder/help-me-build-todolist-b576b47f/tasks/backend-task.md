# Backend Builder Task — Todo List

**Stack:** Node.js / Express 4.x + better-sqlite3  
**Directory:** `./backend/`  
**Start command:** `node server.js` (default port 3001, override via `PORT_BACKEND` env)  
**Seed DB:** Auto-created on first run (`./backend/data/todos.db`)

---

## Overview

Build a REST API for a Todo List. The server must:
- Initialize and persist a SQLite database
- Provide CRUD endpoints for todo items
- Validate inputs and return proper HTTP status codes
- Serve the production frontend from `../frontend/dist` (already implemented)

## API Endpoints

Full contract in `api-contract.json` at the project root.

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|-------------|----------|
| GET    | /api/todos | None | — | 200: Todo[] |
| POST   | /api/todos | None | `{ title: string }` | 201: Todo |
| PATCH  | /api/todos/:id | None | `{ title?: string, completed?: 0\|1 }` | 200: Todo |
| DELETE | /api/todos/:id | None | — | 204: no body |

## Tasks

### 1. Add `better-sqlite3` dependency

```bash
cd backend
npm install better-sqlite3
```

### 2. Modify `backend/server.js`

#### A. Imports (add at top)
```js
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
```

#### B. Database initialization
```js
// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new Database(path.join(dataDir, 'todos.db'));
db.pragma('journal_mode = WAL');

// Create table
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    completed  INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    DEFAULT (datetime('now'))
  )
`);
```

#### C. Remove sample endpoints
- Remove the old `GET /api/data` handler
- Keep or remove `GET /api/health` (optional, handy for smoke tests)

#### D. Implement GET /api/todos
```js
app.get('/api/todos', (req, res) => {
  const { completed } = req.query;
  let rows;
  if (completed === 'true') {
    rows = db.prepare('SELECT * FROM todos WHERE completed = 1 ORDER BY created_at DESC').all();
  } else if (completed === 'false') {
    rows = db.prepare('SELECT * FROM todos WHERE completed = 0 ORDER BY created_at DESC').all();
  } else {
    rows = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
  }
  res.json(rows);
});
```

#### E. Implement POST /api/todos
```js
app.post('/api/todos', (req, res) => {
  const { title } = req.body;

  // Validation
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (title.trim().length > 200) {
    return res.status(400).json({ error: 'Title must be 200 characters or less' });
  }

  const cleanTitle = title.trim();
  const stmt = db.prepare('INSERT INTO todos (title) VALUES (?)');
  const result = stmt.run(cleanTitle);

  const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newTodo);
});
```

#### F. Implement PATCH /api/todos/:id
```js
app.patch('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  // Check todo exists
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  // Validate fields
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }
    if (title.trim().length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }
  }
  if (completed !== undefined) {
    if (![0, 1].includes(completed)) {
      return res.status(400).json({ error: 'Completed must be 0 or 1' });
    }
  }

  // Build dynamic UPDATE
  const updates = [];
  const params = [];
  if (title !== undefined) {
    updates.push('title = ?');
    params.push(title.trim());
  }
  if (completed !== undefined) {
    updates.push('completed = ?');
    params.push(completed);
  }
  params.push(id);

  db.prepare(`UPDATE todos SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  res.json(updated);
});
```

#### G. Implement DELETE /api/todos/:id
```js
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.status(204).send();
});
```

### 3. Handle static file serving (already in boilerplate)

The existing code at the bottom of `server.js` that serves `../frontend/dist` for non-API routes should remain untouched.

```
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) {
        res.status(200).send('<h2>API Server Running. Frontend dist not built yet.</h2>');
      }
    });
  }
});
```

## Error Handling

- All endpoints must return JSON errors with `{ "error": "message" }`
- Return appropriate HTTP status codes (400, 404, 500)
- Wrap DB operations in try-catch and return 500 on unexpected errors

## Verification Checklist

- [ ] `npm install` installs better-sqlite3 without errors
- [ ] `node server.js` starts and creates `data/todos.db`
- [ ] `GET /api/todos` returns `[]` initially
- [ ] `POST /api/todos` with `{ "title": "Test" }` returns 201 with the new todo
- [ ] `POST /api/todos` with empty body returns 400
- [ ] `PATCH /api/todos/1` with `{ "completed": 1 }` returns updated todo
- [ ] `PATCH /api/todos/999` returns 404
- [ ] `DELETE /api/todos/1` returns 204
- [ ] `DELETE /api/todos/999` returns 404
- [ ] Server restart preserves todos (SQLite persistence)
