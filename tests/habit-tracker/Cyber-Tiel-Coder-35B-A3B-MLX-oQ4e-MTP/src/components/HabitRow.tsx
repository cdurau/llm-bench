import { useRhythm } from '../store'
import { colorFor } from '../lib/colors'
import { computeStreaks } from '../lib/streaks'
import { cn } from '../lib/cn'
import type { Habit } from '../types'
import { CheckIcon, FlameIcon } from './icons'

interface HabitRowProps {
  habit: Habit
  date: string
  isDark: boolean
  index?: number
}

export function HabitRow({ habit, date, isDark, index = 0 }: HabitRowProps) {
  const { isDone, datesFor, toggle } = useRhythm()
  const done = isDone(habit.id, date)
  const streak = computeStreaks(datesFor(habit.id), date)
  const tint = colorFor(habit.color, isDark)

  return (
    <button
      type="button"
      onClick={() => void toggle(habit.id, date)}
      aria-pressed={done}
      aria-label={`${habit.name} ${done ? 'erledigt' : 'offen'}`}
      className={cn(
        'card animate-rise press group flex w-full items-center gap-4 px-4 py-3.5 text-left',
        done && 'bg-elevated',
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl"
        style={{
          backgroundColor: `color-mix(in srgb, ${tint} 15%, transparent)`,
        }}
        aria-hidden="true"
      >
        {habit.emoji}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-[0.975rem] font-medium transition-colors',
            done ? 'text-muted' : 'text-ink',
          )}
        >
          {habit.name}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-faint">
          {streak.current > 0 ? (
            <>
              <FlameIcon size={13} style={{ color: tint }} />
              <span className="tnum">
                {streak.current} {streak.current === 1 ? 'Tag' : 'Tage'} Serie
              </span>
            </>
          ) : streak.total > 0 ? (
            <span className="tnum">{streak.total}× erledigt</span>
          ) : (
            <span>Noch keine Serie</span>
          )}
        </span>
      </span>

      <span
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors duration-200',
          done ? 'border-transparent' : 'border-line text-transparent',
        )}
        style={
          done
            ? {
                backgroundColor: tint,
                color: isDark ? '#171614' : '#ffffff',
              }
            : undefined
        }
        aria-hidden="true"
      >
        <CheckIcon
          size={17}
          className={cn(
            'transition-transform duration-200 ease-out',
            done ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
          )}
        />
      </span>
    </button>
  )
}
