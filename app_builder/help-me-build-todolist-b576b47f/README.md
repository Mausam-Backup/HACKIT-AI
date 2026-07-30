# Todo List

> A minimal, fast todo list app built with React 18 + Vite + Express + SQLite.

## MVP Features

- [x] Create todos with title + optional description
- [x] View all todos sorted newest-first
- [x] Toggle completion with a single click
- [x] Delete todos you no longer need
- [x] Data persists across server restarts (SQLite)

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start the backend (Terminal 1)
```bash
cd backend
npm run dev
# Starts on http://localhost:3001
```

### 3. Start the frontend (Terminal 2)
```bash
cd frontend
npm run dev
# Starts on http://localhost:5173
```

### 4. Open the app
Visit **http://localhost:5173** — the Vite dev server proxies `/api` requests to Express.

### Production build
```bash
cd frontend && npm run build
cd ../backend && npm start
# Express serves the built frontend from ./frontend/dist
```

## Project Structure
```
.
├── frontend/            # React 18 + Vite
│   ├── src/
│   │   ├── App.jsx      # Main app component
│   │   ├── App.css      # App styles
│   │   └── main.jsx     # Entry point
│   └── index.html
├── backend/             # Express 4 + SQLite
│   ├── server.js        # API server + DB init
│   ├── data/            # SQLite database file
│   └── package.json
├── api-contract.json    # Shared API schema
├── PLAN.md              # Full project plan
├── TASKS.md             # Trackable task list
└── tasks/
    ├── frontend-task.md # Frontend builder spec
    └── backend-task.md  # Backend builder spec
```
