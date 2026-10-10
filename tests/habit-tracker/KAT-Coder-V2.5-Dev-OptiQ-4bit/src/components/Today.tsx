import { useState, useEffect } from 'react'
import { useHabits } from '../hooks'
import MoodSection from './MoodSection'
import { getTodayStr, getDayLabel } from '../db'

export default function Today() {
  const { habits, completions, streaks, loading, toggle } = useHabits()
  const today = getTodayStr()
  const [animating, setAnimating] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const timer = setTimeout(() => setAnimating({}), 400)
    return () => clearTimeout(timer)
  }, [completions])

  const handled = completions.filter((c) => c.date === today).map((c) => c.habitId)
  const progress = habits.length > 0 ? `${handled.length} von ${habits.length}` : ''

  if (loading) {
    return (
      <div className="px-5 pt-12 pb-4">
        <div className="h-8 w-32 bg-stone-200 dark:bg-stone-800 rounded-lg animate-pulse mb-3" />
        <div className="h-5 w-24 bg-stone-200 dark:bg-stone-800 rounded-lg animate-pulse mb-8" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse mb-3" />
        ))}
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="px-5 pt-12 pb-4">
        <header className="mb-8">
          <h1 className="text-3xl font-light tracking-tight text-stone-900 dark:text-stone-100">
            {getDayLabel(today)}
          </h1>
          <p className="text-stone-400 dark:text-stone-500 mt-1 text-sm">Noch keine Habits.</p>
        </header>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-900 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-300 dark:text-stone-600">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed max-w-xs">
            Wechsle zu Einstellungen und lege deinen ersten Habit an.
          </p>
        </div>
        <MoodSection />
      </div>
    )
  }

  return (
    <div className="px-5 pt-12 pb-4">
      <header className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-stone-900 dark:text-stone-100">
          {getDayLabel(today)}
        </h1>
        <p className="text-stone-400 dark:text-stone-500 mt-1 text-sm">{progress}</p>
      </header>

      <div className="space-y-2 mb-8">
        {habits.map((habit) => {
          const done = handled.includes(habit.id)
          const streak = streaks[habit.id]
          const isAnimating = animating[habit.id]

          return (
            <button
              key={habit.id}
              onClick={() => {
                toggle(habit.id, today)
                setAnimating((prev) => ({ ...prev, [habit.id]: true }))
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 touch-manipulation text-left ${
                done
                  ? 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 opacity-70 hover:opacity-100'
              } ${isAnimating ? 'scale-[0.97]' : 'scale-100'}`}
              style={isAnimating ? { animation: 'pop 0.2s ease-out' } : undefined}
              aria-pressed={done}
            >
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: `${habit.color}20` }}
              >
                {habit.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${done ? 'text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400'}`}>
                  {habit.name}
                </p>
                {streak.current > 0 && (
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                    {streak.current} Tag{streak.current !== 1 ? 'e' : ''} · Best: {streak.best}
                  </p>
                )}
              </div>
              <span
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  done
                    ? 'border-transparent'
                    : 'border-stone-200 dark:border-stone-700'
                }`}
                style={done ? { backgroundColor: habit.color } : undefined}
              >
                {done && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
            </button>
          )
        })}
      </div>

      <MoodSection />

      <style>{`
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
