import { useMemo } from 'react'
import { HabitRow } from '../components/HabitRow'
import { MoodPicker } from '../components/MoodPicker'
import { EmptyState } from '../components/EmptyState'
import { CalendarIcon } from '../components/Icons'
import { MOODS } from '../components/MoodScale'
import { computeStreaks } from '../streaks'
import { todayKey, formatLongDate } from '../date'
import type { Snapshot } from '../store'

interface TodayViewProps {
  data: Snapshot
  onToggle: (habitId: string) => void
  onSetMood: (value: number) => void
  onSetNote: (note: string) => void
  onClearMood: () => void
}

export function TodayView({ data, onToggle, onSetMood, onSetNote, onClearMood }: TodayViewProps) {
  const today = todayKey()

  const completedSet = useMemo(() => {
    const s = new Set<string>()
    for (const c of data.completions) if (c.day === today) s.add(c.habitId)
    return s
  }, [data.completions, today])

  const moodToday = data.moods.find((m) => m.day === today) ?? null

  const total = data.habits.length
  const doneCount = Math.min(completedSet.size, total)

  // Streaks pro Habit (bereits verfügbar über alle Tage).
  const streakByHabit = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const c of data.completions) {
      const list = map.get(c.habitId) ?? []
      list.push(c.day)
      map.set(c.habitId, list)
    }
    const result = new Map<string, ReturnType<typeof computeStreaks>>()
    for (const h of data.habits) {
      result.set(h.id, computeStreaks(map.get(h.id) ?? []))
    }
    return result
  }, [data.completions, data.habits])

  if (total === 0) {
    return (
      <EmptyState
        icon={<CalendarIcon width={30} height={30} />}
        title="Noch keine Habits"
        hint="Lege deinen ersten Habit an — kleine Schritte zählen mehr als große Sprünge."
      />
    )
  }

  return (
    <div className="animate-rise space-y-6">
      {/* Header: Datum + Fortschritt */}
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            {formatLongDate(new Date())}
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold" style={{ letterSpacing: '-0.02em' }}>
            Guten Tag
          </h1>
        </div>
        <div
          className="rounded-2xl px-3.5 py-2 text-sm font-medium"
          style={{ background: 'var(--surface-2)', color: 'var(--ink)' }}
        >
          {doneCount} von {total}
        </div>
      </header>

      {/* Stimmung */}
      <section className="surface rounded-[24px] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
            Wie fühlst du dich heute?
          </h2>
          {moodToday && (
            <button
              type="button"
              onClick={onClearMood}
              className="text-xs font-medium"
              style={{ color: 'var(--muted)' }}
            >
              Zurücksetzen
            </button>
          )}
        </div>

        <MoodPicker value={moodToday?.value ?? null} onSelect={onSetMood} />

        {moodToday && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              {MOODS[moodToday.value - 1].emoji}
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
              {MOODS[moodToday.value - 1].label}
            </span>
          </div>
        )}

        {moodToday && (
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
              Kurze Notiz <span className="sr-only">(optional)</span>
            </label>
            <input
              value={moodToday.note}
              onChange={(e) => onSetNote(e.target.value)}
              placeholder="Zum Beispiel: Schlaf gut, viel Sonne."
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg)',
                color: 'var(--ink)',
              }}
            />
          </div>
        )}
      </section>

      {/* Habits */}
      <section className="space-y-2.5">
        <h2 className="px-1 text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Deine Habits
        </h2>
        <ul className="space-y-2.5">
          {data.habits.map((h) => (
            <HabitRow
              key={h.id}
              habit={h}
              done={completedSet.has(h.id)}
              streaks={streakByHabit.get(h.id) ?? { current: 0, longest: 0 }}
              onToggle={() => onToggle(h.id)}
            />
          ))}
        </ul>
      </section>
    </div>
  )
}
