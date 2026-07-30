# Frontend Builder Task — Todo List

**Stack:** React 18.x + Vite 5.x + lucide-react  
**Directory:** `./frontend/`  
**Build command:** `npm run build`  
**Dev command:** `npm run dev` (starts on port 5173, proxies `/api` to `localhost:3001`)

---

## Overview

Build a single-page Todo List application. The UI must:
- Display a list of todos fetched from the backend
- Allow creating new todos
- Allow toggling completion via checkbox
- Allow deleting todos
- Show loading states and empty states

## API Contract

All requests go to `/api/todos`. The full schema is in `api-contract.json` at the project root.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET    | /api/todos | List all todos (optional `?completed=true/false`) |
| POST   | /api/todos | Create todo `{ title }` → returns 201 |
| PATCH  | /api/todos/:id | Update todo `{ completed }` or `{ title }` |
| DELETE | /api/todos/:id | Delete todo → returns 204 |

## Files to Create / Modify

### 1. `frontend/src/App.jsx` — Main Application Component

**State:**
- `todos` — array of todo objects (from API)
- `newTodo` — string, controlled input value
- `loading` — boolean, true during initial fetch
- `error` — string | null, display API errors

**On Mount (`useEffect`):**
- `GET /api/todos` → set `todos` (sort by newest first, already sorted by backend)
- Catch errors → set `error`

**Rendering:**
- **Header:** App title "Todo List"
- **Add form:** Text `<input>` + "Add" `<button>` (or lucide-react `Plus` icon)
  - On submit: `POST /api/todos` with `{ title }`, then re-fetch list
  - Disable button when input is empty
  - Clear input after success
- **Todo list:** Map over `todos`, render each as a row:
  - `<input type="checkbox">` — checked if `completed === 1`
    - On change: `PATCH /api/todos/:id` with `{ completed: todo.completed ? 0 : 1 }`
  - `<span>` with todo title (strikethrough when completed)
  - Delete `<button>` (lucide-react `Trash2` icon)
    - On click: `DELETE /api/todos/:id`, then remove from local state or re-fetch
- **Loading:** Show "Loading..." text or a spinner while `loading` is true
- **Empty:** Show "No todos yet. Add one above!" when `todos.length === 0`
- **Error:** Show error message in red if present

**No routing needed** — this is a single-page app.

### 2. `frontend/src/App.css` — Styling

- Mobile-first, clean minimal design
- Max width ~600px, centered
- Subtle card style for each todo item
- Completed items have a line-through + muted color
- Smooth hover effects on buttons
- Import in `App.jsx` via `import './App.css'`

### 3. `frontend/src/main.jsx` — Entry Point

Already correct. Only change if you need to add a global CSS reset (optional).

### 4. `frontend/index.html` — HTML Shell

Change `<title>` from current value to **"Todo List"**.

## Stretch Goals (only if time remains)

- **Inline edit:** Double-click title to turn it into an `<input>`, blur or Enter saves via PATCH
- **Filter tabs:** "All" / "Active" / "Completed" buttons that filter the displayed list client-side
- **Search input:** Filter todos by title text (client-side)
- **Animations:** CSS transitions on add/remove/toggle

## Validation / Error Handling

- Trim whitespace from title before sending
- Show inline error if POST fails (e.g., network down)
- Disable form while submission is in-flight

## Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] Adding a todo calls POST and shows it in the list
- [ ] Toggling checkbox calls PATCH and visually updates
- [ ] Deleting calls DELETE and removes the item
- [ ] Page refresh loads persisted todos from the API
- [ ] Empty state shows when no todos exist
- [ ] Loading state shows during initial fetch
- [ ] App works on mobile viewport (375px width)
