import { useMemo, useState } from "react"
import type { Habit } from "../types"
import { useData } from "../hooks/useData"
import { computeStreaks } from "../lib/streaks"
import { formatGerman, todayKey } from "../lib/date"
import HabitRow from "./HabitRow"
import MoodPicker from "./Mood"
import HabitForm from "./HabitForm"
import EmptyState from "./EmptyState"
import { IconPlus } from "./icons"

type FormState = { habit: Habit | null } | null

const MOOD_EMOJI: Record<number, string> = {
  1: "😣",
  2: "😕",
  3: "🙂",
  4: "😄",
  5: "😊",
}

export default function Today() {
  const {
    habits,
    completions,
    moods,
    completedToday,
    toggleHabit,
    addHabit,
    renameHabit,
    updateHabitStyle,
    deleteHabit,
    saveMood,
  } = useData()

  const [form, setForm] = useState<FormState>(null)
  const [moodOpen, setMoodOpen] = useState(false)

  const dateLabel = formatGerman(new Date())

  const completionsByHabit = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const c of completions) {
      const arr = map.get(c.habitId) ?? []
      arr.push(c.date)
      map.set(c.habitId, arr)
    }
    return map
  }, [completions])

  const streaks = useMemo(() => {
    const map = new Map<string, { current: number; longest: number }>()
    for (const h of habits) {
      map.set(h.id, computeStreaks(completionsByHabit.get(h.id) ?? []))
    }
    return map
  }, [habits, completionsByHabit])

  const doneToday = completedToday.length
  const total = habits.length
  const progress = total === 0 ? 0 : doneToday / total

  const today = todayKey()
  const todayMood = moods.find((m) => m.date === today) ?? null

  function handleSave(patch: { name: string; emoji: string; color: string }) {
    if (form?.habit) {
      if (patch.name !== form.habit.name) renameHabit(form.habit.id, patch.name)
      if (patch.emoji !== form.habit.emoji || patch.color !== form.habit.color) {
        updateHabitStyle(form.habit.id, { emoji: patch.emoji, color: patch.color })
      }
    } else {
      addHabit({ name: patch.name, emoji: patch.emoji, color: patch.color })
    }
    setForm(null)
  }

  return (
    <div className="flex flex-col gap-6" id="panel-today" role="tabpanel">
      {/* Header */}
      <header>
        <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
          {dateLabel}
        </div>
        <div className="mb-3 flex items-end justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {doneToday} <span className="text-[var(--text-muted)] text-2xl font-medium">von {total}</span>
          </h1>
          {total > 0 && (
            <span className="text-sm text-[var(--text-muted)]">erledigt</span>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--accent-soft)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-out"
            style={{ width: `${progress * 100}%` }}
            role="progressbar"
            aria-valuenow={doneToday}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={`${doneToday} von ${total} Habits erledigt`}
          />
        </div>
      </header>

      {/* Mood */}
      <section>
        {todayMood ? (
          <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">
                {MOOD_EMOJI[todayMood.value] ?? "🙂"}
              </span>
              <div>
                <div className="text-sm font-medium">Stimmung gespeichert</div>
                {todayMood.note && (
                  <div className="text-xs text-[var(--text-muted)]">{todayMood.note}</div>
                )}
              </div>
            </div>
            <button
              onClick={() => setMoodOpen(true)}
              className="rounded-xl px-3 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
              style={{ minHeight: 44 }}
            >
              Ändern
            </button>
          </div>
        ) : (
          <button
            onClick={() => setMoodOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-[var(--border-strong)] bg-transparent px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]"
            style={{ minHeight: 56 }}
          >
            <span className="text-xl" aria-hidden="true">
              🌤
            </span>
            Stimmung für heute festlegen
          </button>
        )}
      </section>

      {/* Habits */}
      <section>
        {habits.length === 0 ? (
          <EmptyState
            title="Noch keine Habits"
            description="Lege deinen ersten Habit an und starte deine Routine. Kleine Schritte, die Wirkung zeigen."
            action={
              <button
                onClick={() => setForm({ habit: null })}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-text)] transition-colors"
                style={{ minHeight: 44 }}
              >
                <IconPlus className="h-4 w-4" />
                Habit anlegen
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {habits.map((habit, i) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                completed={completedToday.includes(habit.id)}
                streak={streaks.get(habit.id)?.current ?? 0}
                longest={streaks.get(habit.id)?.longest ?? 0}
                onToggle={() => toggleHabit(habit.id)}
                onEdit={() => setForm({ habit })}
                index={i}
              />
            ))}
          </div>
        )}

        {habits.length > 0 && (
          <button
            onClick={() => setForm({ habit: null })}
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]"
            style={{ minHeight: 48 }}
          >
            <IconPlus className="h-4 w-4" />
            Weiteren Habit hinzufügen
          </button>
        )}
      </section>

      {form && (
        <HabitForm
          habit={form.habit}
          onSave={handleSave}
          onDelete={(id) => {
            deleteHabit(id)
            setForm(null)
          }}
          onClose={() => setForm(null)}
        />
      )}

      {moodOpen && (
        <MoodPicker
          value={todayMood?.value}
          note={todayMood?.note}
          onSave={(value, note) => {
            saveMood(value, note)
            setMoodOpen(false)
          }}
          onClose={() => setMoodOpen(false)}
        />
      )}
    </div>
  )
}
