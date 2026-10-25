import { useState } from 'react'
import { useStore } from '../store'
import { getColor } from '../lib/colors'
import type { Habit } from '../types'

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  )
}

export default function HabitRow({ habit, index }: { habit: Habit; index: number }) {
  const { today, isDone, toggle, streaks, updateHabit, deleteHabit, effectiveTheme } = useStore()
  const done = isDone(habit.id, today)
  const color = getColor(habit.colorId)
  const { current, longest } = streaks(habit.id)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(habit.name)

  const saveRename = async () => {
    const n = name.trim()
    if (n && n !== habit.name) await updateHabit({ ...habit, name: n })
    setEditing(false)
  }

  const markerStyle: React.CSSProperties = done
    ? { background: color.light, color: '#ffffff' }
    : {
        background: effectiveTheme === 'dark' ? color.softDark : color.soft,
        color: effectiveTheme === 'dark' ? color.dark : color.light,
      }

  return (
    <li
      data-testid="habit-item"
      className="card reveal stagger flex items-center gap-4 px-5 py-4"
      style={{ '--i': index }}
    >
      <button
        data-testid="habit-toggle"
        type="button"
        aria-pressed={done}
        onClick={() => toggle(habit.id, today)}
        className="theme-transition check-pop flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        style={markerStyle}
        aria-label={done ? `${habit.name} erledigt` : `${habit.name} nicht erledigt`}
      >
        {done ? <CheckIcon /> : <span className="text-xl leading-none">{habit.emoji}</span>}
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              data-testid="habit-rename"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRename()
                if (e.key === 'Escape') setEditing(false)
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-base text-[var(--text)] focus-visible"
              aria-label="Habit umbenennen"
            />
            <button
              data-testid="habit-rename-save"
              type="button"
              onClick={saveRename}
              className="rounded-md bg-[var(--accent-strong)] px-3 py-2 text-sm font-medium text-[var(--bg)] focus-visible"
            >
              Speichern
            </button>
          </div>
        ) : (
          <>
            <h3
              className={`truncate font-serif text-lg ${done ? 'text-[var(--muted)] line-through' : 'text-[var(--text)]'}`}
            >
              {habit.name}
            </h3>
            <div className="flex items-center gap-3 pt-0.5">
              <span
                data-testid="habit-streak"
                className="text-xs font-medium text-[var(--muted)]"
              >
                🔥 {current} / {longest}
              </span>
            </div>
          </>
        )}
      </div>

      {!editing && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            data-testid="habit-rename-trigger"
            type="button"
            onClick={() => {
              setName(habit.name)
              setEditing(true)
            }}
            className="rounded-md p-2 text-[var(--muted)] hover:text-[var(--text)] focus-visible"
            aria-label="Umbenennen"
          >
            <PencilIcon />
          </button>
          <button
            data-testid="habit-delete"
            type="button"
            onClick={() => deleteHabit(habit.id)}
            className="rounded-md p-2 text-[var(--muted)] hover:text-[var(--danger)] focus-visible"
            aria-label="Habit löschen"
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </li>
  )
}