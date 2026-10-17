import { useState, type CSSProperties } from 'react'
import { HabitForm } from '../components/HabitForm'
import { EmptyState } from '../components/EmptyState'
import { HabitRow } from '../components/HabitRow'
import { IconPlus, IconPulse } from '../components/Icon'
import { MoodCard } from '../components/MoodCard'
import { Sheet } from '../components/Sheet'
import { dayKey, formatLong } from '../lib/dates'
import type { Habit, HabitColorKey } from '../lib/db'
import { useNow } from '../hooks/useNow'
import { useApp } from '../state/AppProvider'

type FormState = { mode: 'new' } | { mode: 'edit'; habit: Habit } | null

/** Heute-Screen: Datum, Fortschritt, Stimmung, Habits mit Streaks. */
export function TodayScreen() {
  const app = useApp()
  const [form, setForm] = useState<FormState>(null)

  const now = useNow()
  const today = dayKey(now)
  const habits = app.habits
  const total = habits.length
  const doneCount = habits.filter((habit) => app.isDone(habit.id, today)).length
  const progress = total === 0 ? 0 : doneCount / total

  const submit = async (name: string, emoji: string, color: HabitColorKey) => {
    if (form?.mode === 'edit') {
      await app.updateHabit(form.habit.id, { name, emoji, color })
    } else {
      await app.addHabit(name, emoji, color)
    }
    setForm(null)
  }

  return (
    <div>
      <p className="text-sm text-ink-faint">{formatLong(now)}</p>
      <h1 className="mt-1 font-serif text-[34px] leading-[1.08] tracking-[-0.02em]">Heute</h1>

      {total > 0 && (
        <section
          className="reveal mt-6 rounded-2xl border border-line bg-surface p-5"
          style={{ '--i': 0 } as CSSProperties}
        >
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
              Fortschritt
            </h2>
            <p className="font-serif text-2xl">
              <span className="tabular-nums">{doneCount}</span>{' '}
              <span className="text-base text-ink-faint">von {total}</span>
            </p>
          </div>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-sunken"
            role="progressbar"
            aria-valuenow={doneCount}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label="Fortschritt heute"
          >
            <div
              className="bar-fill h-full w-full origin-left rounded-full bg-accent"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
          {doneCount === total && (
            <p className="mt-3 text-sm text-accent">Alles erledigt. Ruhiger Abschluss.</p>
          )}
        </section>
      )}

      <div className="reveal mt-5" style={{ '--i': 1 } as CSSProperties}>
        <MoodCard key={today} />
      </div>

      {total > 0 ? (
        <>
          <h2 className="mt-6 px-1 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
            Habits
          </h2>
          <ul className="mt-2 space-y-2.5">
            {habits.map((habit, index) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                done={app.isDone(habit.id, today)}
                streaks={app.habitStreaks(habit.id)}
                index={index + 2}
                onToggle={() => void app.toggleCompletion(habit.id, today)}
                onEdit={() => setForm({ mode: 'edit', habit })}
              />
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setForm({ mode: 'new' })}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-paper transition-transform active:scale-[0.99]"
          >
            <IconPlus className="h-4 w-4" />
            Habit anlegen
          </button>
        </>
      ) : (
        <EmptyState
          icon={<IconPulse className="h-6 w-6" />}
          title="Noch keine Habits"
          body="Lege deinen ersten Habit an. Jeder Haken baust du in eine Serie – Rhythm erinnert sich an alles, auch offline."
          action={
            <button
              type="button"
              onClick={() => setForm({ mode: 'new' })}
              className="mt-5 flex h-12 items-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-paper transition-transform active:scale-[0.99]"
            >
              <IconPlus className="h-4 w-4" />
              Ersten Habit anlegen
            </button>
          }
        />
      )}

      {form && (
        <Sheet
          title={form.mode === 'edit' ? 'Habit bearbeiten' : 'Neuer Habit'}
          onClose={() => setForm(null)}
        >
          <HabitForm
            initial={form.mode === 'edit' ? form.habit : null}
            onSubmit={(name, emoji, color) => void submit(name, emoji, color)}
          />
        </Sheet>
      )}
    </div>
  )
}
