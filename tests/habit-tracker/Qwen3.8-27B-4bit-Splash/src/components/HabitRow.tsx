import type { CSSProperties } from 'react'
import type { Habit } from '../lib/db'
import { habitColorVar } from '../lib/palette'
import type { Streaks } from '../lib/streaks'
import { IconCheck, IconFlame, IconStar } from './Icon'

interface HabitRowProps {
  habit: Habit
  done: boolean
  streaks: Streaks
  index: number
  onToggle: () => void
  onEdit: () => void
}

/** Eine Zeile im Heute-Screen: Haken, Name, Streak-Chips. */
export function HabitRow({ habit, done, streaks, index, onToggle, onEdit }: HabitRowProps) {
  const color = habitColorVar(habit.color)

  return (
    <li className="reveal" style={{ '--i': index } as CSSProperties}>
      <div className="flex min-h-[64px] items-center gap-2 rounded-2xl border border-line bg-surface pr-3 transition-shadow hover:shadow-lift">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={done}
          aria-label={`„${habit.name}“ ${done ? 'wieder aufheben' : 'als erledigt markieren'}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center"
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full ${
              done ? 'check-pop' : ''
            }`}
            style={{
              backgroundColor: done ? color : 'transparent',
              border: `1.5px solid ${done ? color : 'var(--ink-faint)'}`,
              color: 'var(--habit-check)',
            }}
          >
            {done && <IconCheck className="h-4 w-4" />}
          </span>
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-lg text-left"
          aria-label={`„${habit.name}“ bearbeiten`}
        >
          <span className="shrink-0 text-xl" aria-hidden="true">
            {habit.emoji}
          </span>
          <span
            className={`truncate text-[15px] font-medium ${
              done ? 'text-ink-faint line-through' : 'text-ink'
            }`}
          >
            {habit.name}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          {streaks.current > 0 && (
            <span
              className="flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold tabular-nums"
              style={{ color, backgroundColor: `color-mix(in oklab, ${color} 13%, transparent)` }}
              aria-label={`Aktuelle Serie: ${streaks.current} Tage`}
            >
              <IconFlame className="h-3 w-3" />
              {streaks.current}
            </span>
          )}
          {streaks.longest > 0 && (
            <span
              className="flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold tabular-nums"
              style={{ color, backgroundColor: `color-mix(in oklab, ${color} 13%, transparent)` }}
              aria-label={`Längste Serie: ${streaks.longest} Tage`}
            >
              <IconStar className="h-3 w-3" />
              {streaks.longest}
            </span>
          )}
        </div>
      </div>
    </li>
  )
}
