import { useState, useEffect, useCallback } from 'react'
import {
  getHabits,
  getCompletions,
  isCompleted,
  completeHabit,
  todayKey,
  dateKey,
  type Habit,
  type HabitCompletion,
} from '../db'

const DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

export default function Today() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Record<string, boolean>>({})
  const [animating, setAnimating] = useState<string | null>(null)
  const [streaks, setStreaks] = useState<Record<string, number>>({})

  const load = useCallback(async () => {
    const h = await getHabits()
    setHabits(h)
    const c = await getCompletions()
    const today = todayKey()
    const map: Record<string, boolean> = {}
    for (const habit of h) {
      map[habit.id] = await isCompleted(today, habit.id)
    }
    setCompletions(map)

    // Calculate streaks
    const streakMap: Record<string, number> = {}
    for (const habit of h) {
      streakMap[habit.id] = calcStreak(habit.id, c)
    }
    setStreaks(streakMap)
  }, [])

  useEffect(() => { load() }, [load])

  const today = new Date()
  const completedCount = habits.filter((h) => completions[h.id]).length

  const toggle = async (habitId: string) => {
    const todayStr = todayKey()
    await completeHabit(todayStr, habitId)
    setCompletions((prev) => ({ ...prev, [habitId]: !prev[habitId] }))
    setAnimating(habitId)
    setTimeout(() => setAnimating(null), 400)
  }

  if (habits.length === 0) {
    return (
      <EmptyState
        title="Noch keine Habits"
        subtitle="Gehe zu den Einstellungen und lege deinen ersten Habit an."
      />
    )
  }

  return (
    <div className="px-5 pt-10 pb-6">
      {/* Header */}
      <header className="mb-8">
        <p className="text-sm tracking-wide text-[#8a8a8a] dark:text-[#9a9a9a] uppercase mb-1">
          {DAY_NAMES[today.getDay()]}. {today.getDate()}. {MONTH_NAMES[today.getMonth()]}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight leading-tight">
          Heute
        </h1>
        <p className="mt-2 text-sm text-[#8a8a8a] dark:text-[#9a9a9a]">
          {completedCount} von {habits.length}
        </p>
      </header>

      {/* Progress bar */}
      <div className="mb-6 h-1 bg-[#e8e7e3] dark:bg-[#333333] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#2d5a3d] dark:bg-[#3d7a54] rounded-full transition-all duration-500 ease-out"
          style={{ width: habits.length > 0 ? `${(completedCount / habits.length) * 100}%` : '0%' }}
        />
      </div>

      {/* Habit list */}
      <ul className="space-y-3">
        {habits.map((habit) => {
          const done = completions[habit.id] ?? false
          const isAnimating = animating === habit.id
          const streak = streaks[habit.id] ?? 0
          return (
            <li key={habit.id}>
              <button
                onClick={() => toggle(habit.id)}
                className={`
                  w-full flex items-center gap-4 px-4 py-4 rounded-2xl
                  border transition-all duration-300 ease-out
                  focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] focus:ring-offset-2
                  ${done
                    ? 'border-transparent'
                    : 'bg-white dark:bg-[#252525] border-[#e8e7e3] dark:border-[#333333] hover:border-[#d0cfc9] dark:hover:border-[#444444]'
                  }
                  ${isAnimating ? 'scale-[0.97]' : 'scale-100'}
                `}
                style={{
                  backgroundColor: done ? `${habit.color}15` : undefined,
                }}
                aria-pressed={done}
              >
                {/* Checkbox */}
                <span
                  className={`
                    flex-shrink-0 w-11 h-11 rounded-xl border-2 flex items-center justify-center
                    transition-all duration-300
                    ${done
                      ? 'bg-white'
                      : 'border-[#d0cfc9] dark:border-[#444444]'
                    }
                  `}
                  style={done ? { borderColor: habit.color, backgroundColor: habit.color } : undefined}
                >
                  {done && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white">
                      <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>

                {/* Emoji */}
                <span className="text-xl flex-shrink-0 w-8 text-center">{habit.emoji}</span>

                {/* Name */}
                <span className={`flex-1 text-base font-medium ${done ? 'line-through opacity-50' : ''}`}>
                  {habit.name}
                </span>

                {/* Streak */}
                {streak > 0 && (
                  <span className="text-xs text-[#8a8a8a] dark:text-[#9a9a9a] font-mono flex-shrink-0">
                    {streak}×
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function calcStreak(habitId: string, completions: HabitCompletion[]): number {
  const sorted = completions
    .filter((c) => c.habitId === habitId)
    .sort((a, b) => b.date.localeCompare(a.date))

  let count = 0
  const d = new Date()
  d.setHours(0, 0, 0, 0)

  while (count < 365) {
    const key = dateKey(d)
    const found = sorted.find((c) => c.date === key)
    if (found) {
      count++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return count
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#d0cfc9] dark:text-[#444444] mb-4">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 24h16M24 16v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="text-base font-medium mb-1">{title}</p>
      <p className="text-sm text-[#8a8a8a] dark:text-[#9a9a9a]">{subtitle}</p>
    </div>
  )
}
