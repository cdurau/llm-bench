import { useState } from 'react'
import { useRhythm } from '../store'
import { formatDayMonth, todayKey, weekdayLong } from '../lib/date'
import { Button } from './Button'
import { EmptyState } from './EmptyState'
import { HabitForm } from './HabitForm'
import { HabitRow } from './HabitRow'
import { MoodCheckin } from './MoodCheckin'
import { LeafIcon, PlusIcon, SparkIcon } from './icons'

export function TodayScreen({ isDark }: { isDark: boolean }) {
  const { habits, loading, isDone } = useRhythm()
  const [formOpen, setFormOpen] = useState(false)
  const date = todayKey()

  const total = habits.length
  const done = habits.filter((habit) => isDone(habit.id, date)).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const allDone = total > 0 && done === total

  return (
    <div>
      <header className="animate-rise flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{weekdayLong(date)}</p>
          <h1 className="display mt-0.5 text-[2.15rem] text-ink">
            {formatDayMonth(date)}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          aria-label="Neue Gewohnheit anlegen"
          className="press mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink hover:border-faint"
        >
          <PlusIcon size={20} />
        </button>
      </header>

      {loading ? (
        <div className="mt-6 space-y-3" aria-hidden="true">
          <div className="h-24 animate-pulse rounded-[20px] bg-elevated" />
          <div className="h-16 animate-pulse rounded-[20px] bg-elevated" />
        </div>
      ) : (
        <>
          {total > 0 ? (
            <section className="card animate-rise mt-6 p-5" style={{ animationDelay: '60ms' }}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted">Fortschritt heute</span>
                <span className="text-sm text-muted">
                  <span className="tnum text-lg font-semibold text-ink">{done}</span> von{' '}
                  <span className="tnum">{total}</span>
                </span>
              </div>
              <div
                className="mt-3 h-2 w-full overflow-hidden rounded-full bg-elevated"
                role="progressbar"
                aria-valuenow={done}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label="Erledigte Gewohnheiten heute"
              >
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {allDone ? (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-accent-strong">
                  <SparkIcon size={14} />
                  Alles erledigt — stark.
                </p>
              ) : null}
            </section>
          ) : null}

          <div className="mt-6">
            <MoodCheckin date={date} />
          </div>

          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
                Deine Gewohnheiten
              </h2>
              {total > 0 ? (
                <span className="tnum text-xs text-faint">
                  {done}/{total}
                </span>
              ) : null}
            </div>

            {total === 0 ? (
              <div className="mt-3">
                <EmptyState
                  icon={<LeafIcon size={24} />}
                  title="Noch ganz leer hier"
                  description="Lege deine erste Gewohnheit an und hake sie ab, wenn du sie erledigt hast."
                  action={
                    <Button variant="primary" onClick={() => setFormOpen(true)}>
                      <PlusIcon size={18} />
                      Erste Gewohnheit anlegen
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="mt-3 space-y-2.5">
                {habits.map((habit, index) => (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    date={date}
                    isDark={isDark}
                    index={index}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {formOpen ? <HabitForm open onClose={() => setFormOpen(false)} /> : null}
    </div>
  )
}