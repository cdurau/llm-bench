import { useState } from 'react'
import type { DataLayer } from '../hooks/useData'
import type { ThemeController } from '../hooks/useTheme'
import { todayKey, formatFullDate, formatRelative } from '../lib/date'
import { MOODS, moodMeta } from '../lib/colors'
import { HabitItem } from './HabitItem'
import { HabitForm } from './HabitForm'
import { EmptyState } from './EmptyState'
import { IconPlus } from './icons'

export function Today({
  data,
  theme,
}: {
  data: DataLayer
  theme: ThemeController
}) {
  const [adding, setAdding] = useState(false)
  const key = todayKey()

  const completedCount = data.habits.filter((h) => data.isDone(h.id, key)).length
  const mood = data.moodByKey.get(key)

  return (
    <div>
      <header className="mb-5">
        <p className="text-sm font-medium text-[var(--color-ink-muted)]">
          {formatRelative(key)}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {formatFullDate(key)}
        </h1>
      </header>

      {data.habits.length === 0 && !adding ? (
        <EmptyState
          title="Noch keine Habits"
          description="Lege dein erstes Habit an und markiere es täglich. Deine Serien bauen sich von selbst auf."
          action={
            <button
              onClick={() => setAdding(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-ink)] px-4 py-3.5 text-base font-medium text-white"
            >
              <IconPlus width={19} height={19} />
              Erstes Habit anlegen
            </button>
          }
        />
      ) : (
        <>
          {data.habits.length > 0 && (
            <div className="mb-5 flex items-baseline justify-between">
              <span className="text-sm font-medium text-[var(--color-ink-muted)]">
                Fortschritt
              </span>
              <span className="text-sm font-semibold tracking-tight">
                {completedCount} von {data.habits.length}
              </span>
            </div>
          )}

          <ul className="space-y-2.5">
            {data.habits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                done={data.isDone(habit.id, key)}
                onToggle={() => data.toggleCompletion(habit.id, key)}
                data={data}
                theme={theme}
              />
            ))}
          </ul>

          {data.habits.length > 0 && (
            <button
              onClick={() => setAdding(true)}
              aria-label="Weiteres Habit anlegen"
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-line)] py-3 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              <IconPlus width={17} height={17} />
              Habit hinzufügen
            </button>
          )}
        </>
      )}

      <MoodCheckIn mood={mood?.mood} note={mood?.note} onSet={(v) => data.setMood(key, v)} onSetNote={(n) => data.setMood(key, mood?.mood ?? 3, n)} />

      <HabitForm
        open={adding}
        onClose={() => setAdding(false)}
        onSubmit={data.addHabit}
      />
    </div>
  )
}

function MoodCheckIn({
  mood,
  note,
  onSet,
  onSetNote,
}: {
  mood?: number
  note?: string
  onSet: (v: number) => void
  onSetNote: (n: string) => void
}) {
  const hasNote = note !== undefined

  return (
    <section className="mt-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-[var(--color-ink-muted)]">
          Wie fühlt du dich?
        </span>
        {mood && (
          <span className="text-xs font-medium text-[var(--color-accent)]">
            {moodMeta(mood).label}
          </span>
        )}
      </div>
      <div className="flex justify-between gap-1">
        {MOODS.map((m) => {
          const active = mood === m.value
          return (
            <button
              key={m.value}
              onClick={() => onSet(m.value)}
              aria-label={`Stimmung ${m.label}`}
              aria-pressed={active}
              className={cls(
                'flex flex-1 flex-col items-center gap-1.5 rounded-xl py-2.5 transition-colors',
                active && 'bg-[var(--color-accent-soft)]',
              )}
            >
              <span className="text-xl leading-none">{m.emoji}</span>
              <span
                className={cls(
                  'text-[10px] font-medium tracking-wide transition-colors',
                  active ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-faint)]',
                )}
              >
                {m.label}
              </span>
            </button>
          )
        })}
      </div>

      {hasNote && (
        <label className="mt-3 block">
          <span className="text-xs font-medium tracking-wide text-[var(--color-ink-muted)] mb-1.5 block">
            Kurznotiz (optional)
          </span>
          <input
            value={note}
            onChange={(e) => onSetNote(e.target.value)}
            placeholder="Was hat heute eine Rolle gespielt?"
            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)] placeholder:text-[var(--color-ink-faint)]"
          />
        </label>
      )}
    </section>
  )
}

function cls(...parts: Array<string | false | null>) {
  return parts.filter(Boolean).join(' ')
}
