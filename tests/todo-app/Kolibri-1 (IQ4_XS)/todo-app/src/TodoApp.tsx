import { useState, useEffect } from 'react'

interface Todo {
  id: string
  text: string
  completed: boolean
}

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos')
    if (savedTodos) {
      try {
        const parsed = JSON.parse(savedTodos) as Todo[]
        return parsed
      } catch (e) {
        console.error('Failed to parse todos:', e)
        return []
      }
    }
    return []
  })
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all')
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true'
  })
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  const addTodo = () => {
    const trimmed = inputValue.trim()
    if (trimmed === '') return
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: trimmed,
      completed: false
    }
    setTodos([...todos, newTodo])
    setInputValue('')
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const editTodo = (id: string, newText: string) => {
    if (newText.trim() === '') return
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ))
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true
    if (filter === 'open') return !todo.completed
    if (filter === 'done') return todo.completed
    return true
  })

  const openCount = todos.filter(todo => !todo.completed).length

  return (
    <div className="todo-app">
      <header className="header">
        <h1>Todo App</h1>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>

      <section className="input-section">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new todo..."
          className="todo-input"
        />
        <button className="add-button" onClick={addTodo}>
          Add
        </button>
      </section>

      <section className="filter-section">
        <div className="filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'open' ? 'active' : ''}
            onClick={() => setFilter('open')}
          >
            Open
          </button>
          <button
            className={filter === 'done' ? 'active' : ''}
            onClick={() => setFilter('done')}
          >
            Done
          </button>
        </div>
        <p className="open-count">{openCount} open todo{openCount !== 1 ? 's' : ''}</p>
      </section>

      <section className="todo-list">
        {filteredTodos.length === 0 ? (
          <p className="empty-state">No todos found.</p>
        ) : (
          filteredTodos.map(todo => (
            <div key={todo.id} className="todo-item">
              <label className="todo-label">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="todo-checkbox"
                />
                <span className={todo.completed ? 'todo-text completed' : 'todo-text'}>
                  {todo.text}
                </span>
              </label>
              <div className="todo-actions">
                <button
                  className="edit-button"
                  onClick={() => {
                    const newText = prompt('Edit todo:', todo.text)
                    if (newText) {
                      editTodo(todo.id, newText)
                    }
                  }}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => deleteTodo(todo.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

export default TodoApp