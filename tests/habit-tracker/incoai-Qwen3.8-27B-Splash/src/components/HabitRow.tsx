import type { CSSProperties } from 'react'
import { Check } from '@phosphor-icons/react'
import type { Habit } from '../lib/db'
import { habitAccent, glyphOnAccent, habitSoftColor } from '../lib/palette'
import type { Streaks } from '../lib/streaks'

interface HabitRowProps {
  habit: Habit
  index: number
  done: boolean
  streaks: Streaks
  mode: 'light' | 'dark'
  onToggle: () => void
  onEdit: () => void
}

function dayWord(count: number): string {
  return count === 1 ? 'Tag' : 'Tage'
}

function streakText(streaks: Streaks): string {
  const { current, longest } = streaks
  if (current > 0 && longest > current) return `Serie ${current} ${dayWord(current)} · Rekord ${longest}`
  if (current > 0) return `Serie ${current} ${dayWord(current)}`
  if (longest > 0) return `Rekord ${longest} ${dayWord(longest)}`
  return 'Noch keine Serie'
}

export function HabitRow({ habit, index, done, streaks, mode, onToggle, onEdit }: HabitRowProps) {
  const accent = habitAccent(habit.color, mode)
  const soft = habitSoftColor(habit.color, mode)
  const glyph = glyphOnAccent(accent, mode)

  return (
    <li className="rise" style={{ '--index': index } as CSSProperties}>
      <div
        className={
          'flex items-center gap-3 rounded-card border bg-surface px-4 py-3.5 shadow-soft transition-[background-color,border-color] duration-300 ' +
          (done ? '' : 'border-line')
        }
        style={done ? { borderColor: accent, backgroundColor: soft } : undefined}
      >
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border border-line bg-canvas text-[22px]"
          aria-hidden="true"
        >
          {habit.emoji}
        </span>

        <button
          type="button"
          onClick={onEdit}
          aria-label={`Gewohnheit „${habit.name}“ bearbeiten`}
          className="min-h-11 min-w-0 flex-1 rounded-lg text-left"
        >
          <span
            className={
              'block truncate text-[15px] font-medium transition-opacity duration-300 ' +
              (done ? 'text-muted' : 'text-ink')
            }
          >
            {habit.name}
          </span>
          <span className="mt-0.5 block truncate font-mono text-[10.5px] uppercase tracking-[0.08em] text-faint">
            {streakText(streaks)}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={done}
          aria-label={done ? `„${habit.name}“ aufheben` : `„${habit.name}“ abhaken`}
          className={
            'grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 transition-[background-color,border-color] duration-200 active:scale-95 ' +
            (done ? 'border-transparent' : 'border-line-strong hover:border-ink/60')
          }
          style={done ? { backgroundColor: accent } : undefined}
        >
          {done ? (
            <span className="pop" style={{ color: glyph }}>
              <Check size={22} weight="bold" />
            </span>
          ) : (
            <span className="text-faint" aria-hidden="true">
              <Check size={22} weight="bold" style={{ opacity: 0.25 }} />
            </span>
          )}
        </button>
      </div>
    </li>
  )
}
