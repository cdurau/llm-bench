import { useState } from 'react'
import { useStore } from '../store'
import { fmtDateLocal } from '../lib/dates'
import EmptyState from './EmptyState'
import HabitRow from './HabitRow'
import AddHabitForm from './AddHabitForm'

export default function Today() {
  const { today, habits, isDone } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const done = habits.filter((h) => isDone(h.id, today)).length

  return (
    <section className="pb-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--text)]">
          {fmtDateLocal(today)}
        </h1>
        <p
          data-testid="progress"
          className="mt-2 text-sm font-medium text-[var(--muted)]"
        >
          {done} von {habits.length}
        </p>
      </header>

      {showAdd && <AddHabitForm onClose={() => setShowAdd(false)} />}

      {habits.length === 0 ? (
        <EmptyState
          title="Noch keine Habits"
          text="Erstelle dein erstes Habit. Ein kleiner Rhythmus, der täglich zählt."
          action={{ label: 'Erstes Habit anlegen', onClick: () => setShowAdd(true) }}
        />
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {habits.map((h, i) => (
            <HabitRow key={h.id} habit={h} index={i} />
          ))}
        </ul>
      )}

      {!showAdd && habits.length > 0 && (
        <button
          data-testid="habit-add"
          type="button"
          onClick={() => setShowAdd(true)}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-5 py-4 text-sm font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-strong)] focus-visible"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Neues Habit
        </button>
      )}
    </section>
  )
}