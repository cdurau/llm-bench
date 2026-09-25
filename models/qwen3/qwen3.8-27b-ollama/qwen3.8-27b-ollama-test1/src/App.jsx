import { useMemo, useState } from 'react'
import { useTodos } from './hooks/useTodos.js'
import { useTheme } from './hooks/useTheme.js'
import ThemeToggle from './components/ThemeToggle.jsx'
import ProgressRing from './components/ProgressRing.jsx'
import TodoForm from './components/TodoForm.jsx'
import FilterBar from './components/FilterBar.jsx'
import TodoItem from './components/TodoItem.jsx'
import { MarkIcon } from './components/icons.jsx'

export default function App() {
   const { theme, toggle } = useTheme()
   const {
      items,
      add,
      toggle: toggleTodo,
      edit,
      remove,
      clearCompleted,
      openCount,
      doneCount,
   } = useTodos()

   const [filter, setFilter] = useState('all')

   const filtered = useMemo(() => {
      if (filter === 'active') return items.filter((it) => !it.done)
      if (filter === 'done') return items.filter((it) => it.done)
      return items
   }, [items, filter])

   const hasItems = items.length > 0

   let emptyMessage
   if (!hasItems) {
      emptyMessage = 'Noch nichts hier. Füge deine erste Aufgabe hinzu.'
   } else if (filter === 'active') {
      emptyMessage = 'Nichts Offenes – alles erledigt. Schön so.'
   } else if (filter === 'done') {
      emptyMessage = 'Noch nichts erledigt.'
   }

   const progressTitle = !hasItems
        ? 'Keine Aufgaben'
        : openCount === 0
        ? 'Alles erledigt'
        : openCount === 1
        ? '1 Aufgabe offen'
        : `${openCount} Aufgaben offen`

   return (
      <main className="app">
         <section className="panel" aria-label="Aufgabenliste">
            <header className="head">
               <div className="brand">
                  <span className="mark"><MarkIcon /></span>
                  <div className="brand-text">
                     <h1 className="title">Klar</h1>
                     <p className="subtitle">Deine Aufgaben</p>
                  </div>
               </div>
               <ThemeToggle theme={theme} onToggle={toggle} />
            </header>

            <section className="progress" aria-label="Fortschritt">
               <ProgressRing done={doneCount} total={items.length} />
               <div className="progress-text">
                  <strong className="progress-title">{progressTitle}</strong>
                  <span className="progress-sub">
                     {hasItems
                          ? `${doneCount} von ${items.length} erledigt`
                          : 'Füge eine Aufgabe hinzu, um loszulegen.'}
                  </span>
               </div>
            </section>

            <div className="composer">
               <TodoForm onAdd={add} />
            </div>

            <div className="controls">
               <FilterBar filter={filter} onFilter={setFilter} />
               <button
                  type="button"
                  className="link-btn"
                  onClick={clearCompleted}
                  disabled={doneCount === 0}
                  aria-label="Alle erledigten Aufgaben löschen"
               >
                  Erledigte löschen
               </button>
            </div>

            {hasItems ? (
               <ul className="list">
                  {filtered.map((item) => (
                     <TodoItem
                        key={item.id}
                        item={item}
                        onToggle={toggleTodo}
                        onEdit={edit}
                        onDelete={remove}
                     />
                  ))}
                  {filtered.length === 0 && (
                     <li className="empty-inline">{emptyMessage}</li>
                  )}
               </ul>
            ) : (
               <p className="empty">{emptyMessage}</p>
            )}
         </section>

         <footer className="app-foot">
            <span className="foot-count">
               {openCount === 1
                    ? '1 Aufgabe offen'
                    : `${openCount} offen`} · {doneCount}{' '}
               erledigt
            </span>
            <span className="foot-hint">Lokal gespeichert · auch offline</span>
         </footer>
      </main>
   )
}
