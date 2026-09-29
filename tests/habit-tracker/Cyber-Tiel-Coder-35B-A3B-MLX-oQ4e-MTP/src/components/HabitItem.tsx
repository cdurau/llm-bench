import { useState } from 'react'
import type { Habit } from '../types'
import type { DataLayer } from '../hooks/useData'
import type { ThemeController } from '../hooks/useTheme'
import { colorFor, HABIT_COLORS } from '../lib/colors'
import { computeStreaks } from '../lib/streaks'
import { cn } from '../lib/cn'
import { IconCheck, IconGear, IconTrash } from './icons'
import { Modal } from './Modal'

export function HabitItem({
  habit,
  done,
  onToggle,
  data,
  theme,
}: {
  habit: Habit
  done: boolean
  onToggle: () => void
  data: DataLayer
  theme: ThemeController
}) {
  const [managing, setManaging] = useState(false)
  const streak = computeStreaks(
    data.completions.filter((c) => c.habitId === habit.id).map((c) => c.date),
  )
  const tone = colorFor(habit.color, theme.isDark)

  return (
    <>
      <li
        className={cn(
          'group relative flex items-center gap-4 rounded-2xl border bg-[var(--color-surface)] px-4 py-3.5 transition-colors',
          'border-[var(--color-line)]',
        )}
      >
        <button
          onClick={onToggle}
          aria-label={done ? `${habit.name} abhaken` : `${habit.name} markieren`}
          aria-pressed={done}
          className="relative shrink-0 flex items-center justify-center h-11 w-11 rounded-full transition-colors"
        >
          {done && (
            <IconCheck
              width={15}
              height={15}
              className="text-white absolute inset-0 m-auto"
            />
          )}
        </button>

        <span
          className="text-xl leading-none"
          aria-hidden="true"
        >
          {habit.emoji}
        </span>

        <div className="min-w-0 flex-1">
          <button
            onClick={() => setManaging(true)}
            className="block max-w-[220px] text-left text-base font-medium tracking-tight truncate"
          >
            <span
              className={cn(
                'transition-opacity',
                done ? 'opacity-48' : 'opacity-100',
              )}
            >
              {habit.name}
            </span>
          </button>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: tone }}
            />
            {streak.current > 0 ? `${streak.current} Tag${streak.current > 1 ? 'e' : ''} Serie` : 'Noch keine Serie'}
          </div>
        </div>

        <button
          onClick={() => setManaging(true)}
          aria-label="Habit verwalten"
          className="shrink-0 flex items-center justify-center text-[var(--color-ink-faint)] opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        >
          <IconGear width={20} height={20} />
        </button>
      </li>

      <ManageHabit
        habit={habit}
        streak={streak}
        open={managing}
        onClose={() => setManaging(false)}
        data={data}
      />
    </>
  )
}

function ManageHabit({
  habit,
  streak,
  open,
  onClose,
  data,
}: {
  habit: Habit
  streak: ReturnType<typeof computeStreaks>
  open: boolean
  onClose: () => void
  data: DataLayer
}) {
  const [name, setName] = useState(habit.name)

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{habit.emoji}</span>
        <h2 className="text-lg font-semibold tracking-tight flex-1">{habit.name}</h2>
      </div>

      <label className="mb-6 block">
        <span className="text-xs font-medium tracking-wide text-[var(--color-ink-muted)] mb-2 block">
          Umbenennen
        </span>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (e.target.value.trim()) data.renameHabit(habit.id, e.target.value)
          }}
          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] px-4 py-2.5 text-base outline-none transition-colors focus:border-[var(--color-accent)]"
        />
      </label>

      <div className="mb-6 flex gap-6 rounded-xl bg-[var(--color-surface-2)] px-4 py-3.5">
        <Stat label="Aktuelle Serie" value={streak.current > 0 ? `${streak.current}d` : '—'} />
        <Stat label="Längste Serie" value={streak.longest > 0 ? `${streak.longest}d` : '—'} />
        <Stat label="Gesamt" value={`${streak.total}×`} />
      </div>

      <div className="mb-7">
        <span className="text-xs font-medium tracking-wide text-[var(--color-ink-muted)] mb-2 block">
          Farbe
        </span>
        <div className="flex flex-wrap gap-3">
          {HABIT_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => data.setHabitColor(habit.id, c.value)}
              aria-label={`Farbe ${c.label}`}
              aria-pressed={habit.color === c.value}
              className={cn(
                'h-9 w-9 rounded-full transition-transform',
                habit.color === c.value && 'scale-110',
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          data.removeHabit(habit.id)
          onClose()
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-line)] px-4 py-3 text-base font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-2)]"
      >
        <IconTrash width={18} height={18} />
        Habit löschen
      </button>
    </Modal>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-lg font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">{label}</p>
    </div>
  )
}
