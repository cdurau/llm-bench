import { CheckIcon, FlameIcon } from './Icons'
import type { Habit } from '../types'
import type { Streaks } from '../streaks'
import { textColorFor } from '../palette'

interface HabitRowProps {
  habit: Habit
  done: boolean
  streaks: Streaks
  onToggle: () => void
}

/**
 * Eine Habit-Zeile zum Abhaken. Große, klare Fläche; weiche Kanten;
 * sanfte Pop-Animation beim Abhaken.
 */
export function HabitRow({ habit, done, streaks, onToggle }: HabitRowProps) {
  const textOnColor = textColorFor(habit.color)

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        className="btn w-full items-center gap-3 rounded-[20px] p-3 text-left"
        style={{
          background: done ? 'var(--surface-2)' : 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: done ? 'none' : '0 1px 2px var(--shadow-soft)',
        }}
      >
        {/* Emoji-Chip auf der Habit-Farbe */}
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-xl"
          style={{ background: habit.color, color: textOnColor }}
        >
          <span aria-hidden>{habit.emoji}</span>
        </span>

        {/* Name + optional Streak */}
        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-[15px]"
            style={{
              color: done ? 'var(--muted)' : 'var(--ink)',
              fontWeight: done ? 500 : 600,
            }}
          >
            {habit.name}
          </span>
          {streaks.current > 0 && (
            <span className="mt-0.5 inline-flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
              <FlameIcon width={13} height={13} />
              {streaks.current} Tag{streaks.current === 1 ? '' : 'e'} · Rekord {streaks.longest}
            </span>
          )}
        </span>

        {/* Abhaken-Button */}
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full"
          style={{
            background: done ? habit.color : 'transparent',
            color: done ? '#ffffff' : 'var(--muted)',
          }}
        >
          <span key={done ? 'on' : 'off'} className={done ? 'animate-pop' : ''}>
            <CheckIcon width={22} height={22} />
          </span>
        </span>
      </button>
    </li>
  )
}
