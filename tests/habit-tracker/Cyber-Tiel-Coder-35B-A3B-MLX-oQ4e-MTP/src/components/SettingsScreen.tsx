import { useState } from 'react'
import { cn } from '../lib/cn'
import { colorFor } from '../lib/colors'
import type { ThemeController } from '../hooks/useTheme'
import { useRhythm } from '../store'
import type { Habit, ThemePreference } from '../types'
import { Button } from './Button'
import { HabitForm } from './HabitForm'
import { MonitorIcon, MoonIcon, PencilIcon, PlusIcon, SunIcon } from './icons'

const THEME_OPTIONS: {
  id: ThemePreference
  label: string
  Icon: typeof SunIcon
}[] = [
  { id: 'system', label: 'System', Icon: MonitorIcon },
  { id: 'light', label: 'Hell', Icon: SunIcon },
  { id: 'dark', label: 'Dunkel', Icon: MoonIcon },
]

export function SettingsScreen({ theme }: { theme: ThemeController }) {
  const { habits, moods, datesFor } = useRhythm()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Habit | null>(null)

  const completions = habits.reduce(
    (sum, habit) => sum + datesFor(habit.id).length,
    0,
  )

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(habit: Habit) {
    setEditing(habit)
    setFormOpen(true)
  }

  return (
    <div>
      <header className="animate-rise">
        <p className="text-sm text-muted">Anpassen</p>
        <h1 className="display mt-0.5 text-[2.15rem] text-ink">Einstellungen</h1>
      </header>

      <section className="card animate-rise mt-6 p-5" aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
          Erscheinungsbild
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-elevated p-1">
          {THEME_OPTIONS.map(({ id, label, Icon }) => {
            const active = theme.preference === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => theme.setTheme(id)}
                aria-pressed={active}
                className={cn(
                  'press flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium',
                  active ? 'bg-surface text-ink' : 'text-muted hover:text-ink',
                )}
              >
                <Icon size={18} />
                {label}
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-faint">
          {theme.preference === 'system'
            ? 'Folgt gerade der Systemeinstellung.'
            : 'Feste Auswahl — wird auf diesem Gerät gespeichert.'}
        </p>
      </section>

      <section className="mt-8" aria-labelledby="habits-heading">
        <div className="flex items-center justify-between">
          <h2
            id="habits-heading"
            className="text-xs font-medium uppercase tracking-[0.08em] text-muted"
          >
            Gewohnheiten
          </h2>
          <button
            type="button"
            onClick={openNew}
            className="press inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-accent-strong"
          >
            <PlusIcon size={16} />
            Neu
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="card mt-3 px-5 py-8 text-center">
            <p className="text-sm text-muted">
              Du hast noch keine Gewohnheiten angelegt.
            </p>
            <Button variant="soft" className="mt-4" onClick={openNew}>
              <PlusIcon size={18} />
              Gewohnheit anlegen
            </Button>
          </div>
        ) : (
          <ul className="card mt-3 divide-y divide-line px-4">
            {habits.map((habit) => (
              <li key={habit.id} className="flex items-center gap-3 py-2.5">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${colorFor(
                      habit.color,
                      theme.isDark,
                    )} 15%, transparent)`,
                  }}
                  aria-hidden="true"
                >
                  {habit.emoji}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink">
                  {habit.name}
                </span>
                <button
                  type="button"
                  onClick={() => openEdit(habit)}
                  aria-label={`${habit.name} bearbeiten`}
                  className="press grid h-11 w-11 place-items-center rounded-full border border-line text-muted hover:border-faint hover:text-ink"
                >
                  <PencilIcon size={17} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card mt-8 p-5" aria-labelledby="about-heading">
        <h2 id="about-heading" className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
          Über Rhythm
        </h2>
        <p className="mt-3 text-sm text-muted">
          Alle Daten bleiben ausschließlich auf diesem Gerät gespeichert — kein Konto,
          kein Server. Rhythm funktioniert nach dem ersten Laden vollständig offline.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-elevated px-3 py-2.5">
            <dt className="text-xs text-muted">Einträge</dt>
            <dd className="tnum text-lg font-semibold text-ink">{completions}</dd>
          </div>
          <div className="rounded-xl bg-elevated px-3 py-2.5">
            <dt className="text-xs text-muted">Stimmungstage</dt>
            <dd className="tnum text-lg font-semibold text-ink">{moods.length}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-faint">Version 1.0 · installierbare PWA</p>
      </section>

      {formOpen ? (
        <HabitForm
          open
          habit={editing}
          onClose={() => setFormOpen(false)}
        />
      ) : null}
    </div>
  )
}
