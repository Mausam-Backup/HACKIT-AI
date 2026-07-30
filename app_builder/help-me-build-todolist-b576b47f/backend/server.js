/**
 * Todo List API Server
 *
 * Provides a REST API for managing todo items with a SQLite database (sql.js).
 * Serves production frontend from ../frontend/dist when available.
 *
 * @module server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// sql.js is a pure-JS SQLite implementation (compiled to WASM).
// It requires async initialization, so we bootstrap inside an init function.
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT_BACKEND || process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// Allow any origin
app.use(cors({ origin: true }));
app.use(express.json());

// ---------------------------------------------------------------------------
// Database helpers (sql.js wrapper)
// ---------------------------------------------------------------------------

const DB_PATH = path.join(__dirname, 'data', 'todos.db');
const DATA_DIR = path.join(__dirname, 'data');

/**
 * Simple wrapper around sql.js Database to provide a better-sqlite3-like API.
 * Automatically persists to disk after write operations.
 */
class TodoDatabase {
  constructor(sqlDb) {
    this._db = sqlDb;
  }

  /** Run a query that returns no rows (INSERT, UPDATE, DELETE, DDL). */
  run(sql, params = []) {
    this._db.run(sql, params);
    this._save();
  }

  /** Run an INSERT and return the new rowid (must save after). */
  insert(sql, params = []) {
    this._db.run(sql, params);
    const id = this._lastInsertRowid();
    this._save();
    return id;
  }

  /** Fetch a single row as an object, or undefined if no match. */
  get(sql, params = []) {
    const stmt = this._db.prepare(sql);
    stmt.bind(params);
    let row;
    if (stmt.step()) {
      row = stmt.getAsObject();
    }
    stmt.free();
    return row;
  }

  /** Fetch all matching rows as an array of objects. */
  all(sql, params = []) {
    const stmt = this._db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }

  /** Execute DDL or multi-statement SQL (no params). */
  exec(sql) {
    this._db.exec(sql);
    this._save();
  }

  /**
   * Return the last inserted rowid without triggering a save.
   * Used internally by insert() before persisting.
   */
  _lastInsertRowid() {
    const row = this.get('SELECT last_insert_rowid() AS id');
    return row ? row.id : null;
  }

  /**
   * Return the last inserted rowid.
   * Must be called immediately after an INSERT on the same db handle.
   * NOTE: After run() + _save(), last_insert_rowid() is reset to 0.
   * Use insert() instead to get the correct id.
   */
  lastInsertRowid() {
    return this._lastInsertRowid();
  }

  /** Persist the database to disk. */
  _save() {
    const data = this._db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

/** Global database instance (set after async init). */
let db;

// ---------------------------------------------------------------------------
// Async bootstrap: initialise sql.js, create tables, then start listening
// ---------------------------------------------------------------------------

async function bootstrap() {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Load or create the database
  const SQL = await initSqlJs();
  let sqlDb;
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(buffer);
  } else {
    sqlDb = new SQL.Database();
  }

  db = new TodoDatabase(sqlDb);

  // Create the todos table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    NOT NULL,
      completed  INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // -------------------------------------------------------------------------
  // API Routes
  // -------------------------------------------------------------------------

  /**
   * GET /api/health
   *
   * Health check endpoint. Returns a simple status object.
   *
   * @route   GET /api/health
   * @returns {Object} 200 - { status: 'ok', app: string, timestamp: string }
   */
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      app: 'Todo List API',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /api/todos
   *
   * List all todo items, optionally filtered by completion status.
   * Results are sorted by created_at in descending order.
   *
   * @route   GET /api/todos
   * @query   {string}  [completed] - Filter by 'true' (completed=1) or 'false' (completed=0)
   * @returns {Object[]} 200 - Array of todo objects
   */
  app.get('/api/todos', (req, res) => {
    try {
      const { completed } = req.query;
      let rows;

      if (completed === 'true') {
        rows = db.all(
          'SELECT * FROM todos WHERE completed = 1 ORDER BY created_at DESC'
        );
      } else if (completed === 'false') {
        rows = db.all(
          'SELECT * FROM todos WHERE completed = 0 ORDER BY created_at DESC'
        );
      } else {
        rows = db.all('SELECT * FROM todos ORDER BY created_at DESC');
      }

      res.json(rows);
    } catch (err) {
      console.error('Error fetching todos:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * POST /api/todos
   *
   * Create a new todo item.
   *
   * @route   POST /api/todos
   * @param   {Object}  body             - Request body
   * @param   {string}  body.title       - The todo title (1-200 characters)
   * @returns {Object}   201 - The newly created todo object
   * @returns {Object}   400 - Validation error
   */
  app.post('/api/todos', (req, res) => {
    try {
      const { title } = req.body;

      // Validation
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required' });
      }
      if (title.trim().length > 200) {
        return res
          .status(400)
          .json({ error: 'Title must be 200 characters or less' });
      }

      const cleanTitle = title.trim();
      const newId = db.insert('INSERT INTO todos (title) VALUES (?)', [cleanTitle]);

      const newTodo = db.get('SELECT * FROM todos WHERE id = ?', [newId]);
      res.status(201).json(newTodo);
    } catch (err) {
      console.error('Error creating todo:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * PATCH /api/todos/:id
   *
   * Partially update an existing todo item. Supports updating title and/or
   * completion status.
   *
   * @route   PATCH /api/todos/:id
   * @param   {number}  params.id              - The todo ID
   * @param   {Object}  body                   - Request body with fields to update
   * @param   {string}  [body.title]           - New title (1-200 characters)
   * @param   {number}  [body.completed]       - 0 = not completed, 1 = completed
   * @returns {Object}   200 - The updated todo object
   * @returns {Object}   400 - Validation error
   * @returns {Object}   404 - Todo not found
   */
  app.patch('/api/todos/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { title, completed } = req.body;

      // Check todo exists
      const todo = db.get('SELECT * FROM todos WHERE id = ?', [id]);
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      // Validate fields
      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) {
          return res.status(400).json({ error: 'Title cannot be empty' });
        }
        if (title.trim().length > 200) {
          return res
            .status(400)
            .json({ error: 'Title must be 200 characters or less' });
        }
      }
      if (completed !== undefined) {
        if (![0, 1].includes(completed)) {
          return res.status(400).json({ error: 'Completed must be 0 or 1' });
        }
      }

      // Build dynamic UPDATE query
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
      params.push(Number(id));

      db.run(`UPDATE todos SET ${updates.join(', ')} WHERE id = ?`, params);

      const updated = db.get('SELECT * FROM todos WHERE id = ?', [Number(id)]);
      res.json(updated);
    } catch (err) {
      console.error('Error updating todo:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * DELETE /api/todos/:id
   *
   * Permanently delete a todo item.
   *
   * @route   DELETE /api/todos/:id
   * @param   {number}  params.id  - The todo ID
   * @returns           204 - Successfully deleted, no content
   * @returns {Object}  404 - Todo not found
   */
  app.delete('/api/todos/:id', (req, res) => {
    try {
      const { id } = req.params;
      const todo = db.get('SELECT * FROM todos WHERE id = ?', [Number(id)]);
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      db.run('DELETE FROM todos WHERE id = ?', [Number(id)]);
      res.status(204).send();
    } catch (err) {
      console.error('Error deleting todo:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // -----------------------------------------------------------------------
  // Static file serving (production frontend)
  // -----------------------------------------------------------------------

  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
        if (err) {
          res
            .status(200)
            .send('<h2>API Server Running. Frontend dist not built yet.</h2>');
        }
      });
    }
  });

  // -----------------------------------------------------------------------
  // Start server
  // -----------------------------------------------------------------------

  app.listen(PORT, () => {
    console.log(`Backend API server running on http://localhost:${PORT}`);
  });
}

// Run bootstrap and handle top-level errors
bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
