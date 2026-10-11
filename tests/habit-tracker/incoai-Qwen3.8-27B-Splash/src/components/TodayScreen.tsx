import { useMemo, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { useRhythm } from '../store'
import { useTheme } from '../lib/theme'
import { computeStreaks } from '../lib/streaks'
import { formatLongDate, todayKey } from '../lib/dates'
import type { Habit } from '../lib/db'
import { HabitRow } from './HabitRow'
import { HabitForm } from './HabitForm'
import { MoodCard } from './MoodCard'
import { EmptyState } from './EmptyState'

/** Heute-Screen: Datum, Fortschritt, Stimmung, Abhake-Liste und Habit-Verwaltung. */
export function TodayScreen() {
  const { habits, completions, toggleCompletion } = useRhythm()
  const { mode } = useTheme()
  const today = todayKey()

  const [editing, setEditing] = useState<Habit | 'new' | null>(null)

  const habitDates = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const c of completions) {
      let set = map.get(c.habitId)
      if (!set) {
        set = new Set()
        map.set(c.habitId, set)
      }
      set.add(c.date)
    }
    return map
  }, [completions])

  const doneToday = new Set(
    habits.filter((h) => habitDates.get(h.id)?.has(today)).map((h) => h.id),
  )
  const doneCount = doneToday.size

  const progress = habits.length > 0 ? doneCount / habits.length : 0

  return (
    <div className="space-y-6">
      <header className="rise">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Rhythm</p>
        <h1 className="mt-2 font-serif text-[30px] leading-tight font-semibold tracking-[-0.02em] text-ink">
          {formatLongDate(today)}
        </h1>
        {habits.length > 0 ? (
          <div className="mt-4 flex items-center gap-3">
            <div
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={habits.length}
              aria-valuenow={doneCount}
              aria-label="Täglicher Fortschritt"
            >
              <div
                className="h-full origin-left rounded-full bg-ink transition-transform duration-500"
                style={{ transform: `scaleX(${progress})`, transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
              />
            </div>
            <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              {doneCount} von {habits.length}
            </span>
          </div>
        ) : null}
      </header>

      <MoodCard />

      <section aria-label="Gewohnheiten">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">
            Gewohnheiten
          </h2>
          {habits.length > 0 ? (
            <span className="font-mono text-[11px] text-faint">{habits.length} gesamt</span>
          ) : null}
        </div>

        {habits.length === 0 ? (
          <EmptyState
            index={2}
            title="Noch keine Gewohnheiten"
            text="Lege deine erste Gewohnheit an – Rhythm erinnert dich nicht, er feiert nur mit."
            action={
              <button
                type="button"
                onClick={() => setEditing('new')}
                className="min-h-11 rounded-[6px] bg-ink px-5 text-sm font-medium text-canvas transition-transform active:scale-[0.98]"
              >
                Erste Gewohnheit anlegen
              </button>
            }
          />
        ) : (
          <ul className="mt-3 space-y-3">
            {habits.map((habit, index) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                index={index + 2}
                done={doneToday.has(habit.id)}
                streaks={computeStreaks(habitDates.get(habit.id) ?? new Set())}
                mode={mode}
                onToggle={() => void toggleCompletion(habit.id)}
                onEdit={() => setEditing(habit)}
              />
            ))}
          </ul>
        )}

        {habits.length > 0 ? (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-card border border-line bg-surface text-sm font-medium text-ink shadow-soft transition-[transform,border-color] hover:border-line-strong active:scale-[0.98]"
          >
            <Plus size={16} weight="bold" />
            Neues Habit
          </button>
        ) : null}
      </section>

      {editing !== null ? (
        <HabitForm habit={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  )
}
