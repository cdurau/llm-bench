import { useRef, useState } from 'react'
import { todayKey } from './lib/date'
import { useAppStore } from './hooks/useAppStore'
import { useNotifications } from './hooks/useNotifications'
import { computeStats, listCategories } from './store/createStore'
import type { Activity, ActivityInput } from './types'
import { ActivityForm } from './components/ActivityForm'
import { ActivityList } from './components/ActivityList'
import { DayNavigator } from './components/DayNavigator'
import { Dashboard } from './components/Dashboard'
import { EmptyState } from './components/EmptyState'
import { Header } from './components/Header'
import { Notifications } from './components/Notifications'
import { EmptyListIcon, PlusIcon } from './components/icons'

export function App() {
  const {
    data,
    selectedDate,
    setSelectedDate,
    addActivity,
    editActivity,
    deleteActivity,
    toggleComplete,
  } = useAppStore()

  const { notify } = useNotifications()
  const [editId, setEditId] = useState<string | null>(null)
  const addRef = useRef<HTMLDetailsElement>(null)

  const activities = Object.values(data.activities).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  )
  const categories = listCategories(data)
  const stats = computeStats(data, selectedDate)
  const isFuture = selectedDate > todayKey()

  function handleAdd(input: ActivityInput) {
    const created = addActivity(input)
    if (created) {
      notify('Aktivität hinzugefügt', 'success')
      addRef.current?.removeAttribute('open')
    }
  }

  function handleEdit(id: string, input: ActivityInput) {
    const ok = editActivity(id, input)
    if (ok) {
      notify('Aktivität gespeichert', 'success')
      setEditId(null)
    }
  }

  function handleDelete(id: string) {
    deleteActivity(id)
    notify('Aktivität gelöscht', 'info')
    setEditId(null)
  }

  function handleToggle(id: string) {
    toggleComplete(id, selectedDate)
  }

  function openAdd() {
    addRef.current?.setAttribute('open', '')
  }

  const editing = editId ? data.activities[editId] : undefined

  return (
    <div className="app">
      <div className="app__inner">
        <Header />
        <DayNavigator selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <Dashboard stats={stats} />

        <details ref={addRef} className="add-panel">
          <summary className="add-panel__summary">
            <PlusIcon /> Neue Aktivität
          </summary>
          <ActivityForm
            mode="create"
            categories={categories}
            onSubmit={handleAdd}
            onCancel={() => addRef.current?.removeAttribute('open')}
          />
        </details>

        {activities.length === 0 ? (
          <EmptyState
            icon={<EmptyListIcon />}
            title="Noch keine Aktivitäten"
            description="Lege deine erste Aktivität oder Gewohnheit an und markiere sie am jeweiligen Tag als erledigt."
            action={
              <button type="button" className="btn btn--primary" onClick={openAdd}>
                <PlusIcon /> Erste Aktivität anlegen
              </button>
            }
          />
        ) : (
          <>
            {isFuture && (
              <p className="hint" role="status">
                Dieser Tag liegt in der Zukunft. Aktivitäten dürfen dort noch nicht als erledigt markiert werden.
              </p>
            )}
            <ActivityList
              activities={activities}
              date={selectedDate}
              data={data}
              onToggle={handleToggle}
              onEdit={setEditId}
              onDelete={handleDelete}
            />
          </>
        )}
      </div>

      {editing && (
        <div className="dialog-backdrop" onClick={() => setEditId(null)}>
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Aktivität bearbeiten"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="dialog__title">Aktivität bearbeiten</h2>
            <ActivityForm
              mode="edit"
              initial={editing}
              categories={categories}
              onSubmit={(input) => handleEdit(editing.id, input)}
              onCancel={() => setEditId(null)}
              onDelete={() => handleDelete(editing.id)}
            />
          </div>
        </div>
      )}

      <Notifications />
    </div>
  )
}
