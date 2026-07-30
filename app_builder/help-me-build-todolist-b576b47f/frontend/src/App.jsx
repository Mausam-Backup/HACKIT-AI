import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Search, X } from 'lucide-react'
import './App.css'

export default function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('all') // 'all' | 'active' | 'completed'
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/todos')
      if (!res.ok) throw new Error('Failed to fetch todos')
      const data = await res.json()
      setTodos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    const title = newTodo.trim()
    if (!title) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to create todo')
      }
      setNewTodo('')
      await fetchTodos()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(todo) {
    setError(null)
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: todo.completed ? 0 : 1 })
      })
      if (!res.ok) throw new Error('Failed to update todo')
      const updated = await res.json()
      setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    setError(null)
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete todo')
      setTodos(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  function handleDoubleClick(todo) {
    setEditingId(todo.id)
    setEditTitle(todo.title)
  }

  async function handleEditSave(id) {
    const title = editTitle.trim()
    if (!title) {
      setEditingId(null)
      return
    }
    setError(null)
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      if (!res.ok) throw new Error('Failed to update todo')
      const updated = await res.json()
      setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)))
    } catch (err) {
      setError(err.message)
    } finally {
      setEditingId(null)
    }
  }

  function handleEditKeyDown(e, id) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleEditSave(id)
    } else if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return !!todo.completed
    return true
  })

  const searchedTodos = search.trim()
    ? filteredTodos.filter(todo =>
        todo.title.toLowerCase().includes(search.toLowerCase())
      )
    : filteredTodos

  const activeCount = todos.filter(t => !t.completed).length

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Todo List</h1>
      </header>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          ref={inputRef}
          type="text"
          className="add-input"
          placeholder="What needs to be done?"
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          disabled={submitting}
        />
        <button
          type="submit"
          className="add-btn"
          disabled={!newTodo.trim() || submitting}
        >
          <Plus size={20} />
          Add
        </button>
      </form>

      {/* Search */}
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search todos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <span className="active-count">{activeCount} remaining</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading todos...</span>
        </div>
      ) : searchedTodos.length === 0 ? (
        <div className="empty-state">
          {search.trim()
            ? 'No todos match your search.'
            : 'No todos yet. Add one above!'}
        </div>
      ) : (
        <ul className="todo-list">
          {searchedTodos.map(todo => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''} ${
                editingId === todo.id ? 'editing' : ''
              }`}
            >
              <label className="todo-checkbox-label">
                <input
                  type="checkbox"
                  className="todo-checkbox"
                  checked={!!todo.completed}
                  onChange={() => handleToggle(todo)}
                />
                <span className="checkmark" />
              </label>

              {editingId === todo.id ? (
                <input
                  type="text"
                  className="edit-input"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onBlur={() => handleEditSave(todo.id)}
                  onKeyDown={e => handleEditKeyDown(e, todo.id)}
                  autoFocus
                />
              ) : (
                <span
                  className="todo-title"
                  onDoubleClick={() => handleDoubleClick(todo)}
                  title="Double-click to edit"
                >
                  {todo.title}
                </span>
              )}

              <button
                className="delete-btn"
                onClick={() => handleDelete(todo.id)}
                title="Delete todo"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
