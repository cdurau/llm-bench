import { useState } from 'react'
import type { Habit, HabitColorKey } from '../lib/db'
import { HABIT_COLORS, HABIT_EMOJIS, habitColorVar } from '../lib/palette'
import { IconCheck } from './Icon'

interface HabitFormProps {
  /** null => neuer Habit */
  initial: Habit | null
  onSubmit: (name: string, emoji: string, color: HabitColorKey) => void
}

export function HabitForm({ initial, onSubmit }: HabitFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🌱')
  const [color, setColor] = useState<HabitColorKey>(initial?.color ?? 'sage')

  return (
    <form
      className="mt-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (!name.trim()) return
        onSubmit(name.trim(), emoji, color)
      }}
    >
      <label
        htmlFor="habit-name"
        className="block text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft"
      >
        Name
      </label>
      <input
        id="habit-name"
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="z. B. Morgens lesen"
        maxLength={40}
        className="mt-2 h-12 w-full rounded-lg border border-line bg-sunken/60 px-4 text-[15px] text-ink placeholder:text-ink-faint"
      />

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
        Emoji
      </p>
      <div className="mt-2 grid grid-cols-6 gap-1.5">
        {HABIT_EMOJIS.map((option) => {
          const selected = emoji === option
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              aria-label={`Emoji ${option} wählen`}
              onClick={() => setEmoji(option)}
              className={`flex h-11 items-center justify-center rounded-lg text-xl ${
                selected ? 'bg-sunken ring-1 ring-line' : ''
              }`}
            >
              <span aria-hidden="true">{option}</span>
            </button>
          )
        })}
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
        Farbe
      </p>
      <div className="mt-2 flex gap-1.5">
        {HABIT_COLORS.map(({ key, label }) => {
          const selected = color === key
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              aria-label={`Farbe ${label} wählen`}
              onClick={() => setColor(key)}
              className="flex h-11 w-11 items-center justify-center rounded-full"
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                  backgroundColor: habitColorVar(key),
                  color: 'var(--habit-check)',
                  outline: selected ? '2px solid var(--ink)' : undefined,
                  outlineOffset: '2px',
                }}
              >
                {selected && <IconCheck className="h-3.5 w-3.5" />}
              </span>
            </button>
          )
        })}
      </div>

      <button
        type="submit"
        disabled={!name.trim()}
        className="mt-6 h-12 w-full rounded-lg bg-ink text-sm font-semibold text-paper transition-transform active:scale-[0.99] disabled:opacity-40"
      >
        {initial ? 'Speichern' : 'Habit anlegen'}
      </button>
    </form>
  )
}
