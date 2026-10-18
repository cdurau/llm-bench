import { useState, useEffect, useCallback } from 'react'
import {
  getHabits,
  getCheckinsToday,
  toggleCheckIn,
  getStreaks,
  type Habit,
} from '../db'

export default function TodayScreen() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [streaks, setStreaks] = useState<Record<string, { current: number; longest: number }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const h = await getHabits()
      const c = await getCheckinsToday()
      const s = await getStreaks()
      if (mounted) {
        setHabits(h)
        setChecked(c)
        setStreaks(s)
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const completedCount = checked.size
  const totalCount = habits.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const todayDate = new Date()
  const formatted = todayDate.toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  const handleToggle = useCallback(async (habitId: string) => {
    await toggleCheckIn(habitId)
    setChecked(prev => {
      const next = new Set(prev)
      next.has(habitId) ? next.delete(habitId) : next.add(habitId)
      return next
    })
  }, [])

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
          {formatted}
        </p>
        <h1 className="text-3xl font-bold tracking-tight mt-1 text-[var(--color-text)]">Heute</h1>
      </div>

      {/* Progress */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--color-text-secondary)]">
            {completedCount} von {totalCount} geschafft
          </span>
          <span className="text-xs font-semibold">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-text)] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Habit list */}
      <div className="px-5 flex-1 pb-24">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-[var(--color-border)] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <EmptyState title="Noch keine Habits" description="Gehe zu Einstellungen und füge deinen ersten Habit hinzu." />
        ) : (
          <div className="space-y-2.5">
            {habits.map((habit, index) => {
              const isDone = checked.has(habit.id)
              const streak = streaks[habit.id]
              return (
                <div
                  key={habit.id}
                  className="animate-[fadeIn_0.4s_ease-out_both]"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <button
                    onClick={() => handleToggle(habit.id)}
                    className={`
                      w-full flex items-center gap-3.5 px-4 py-3.5
                      rounded-xl transition-colors duration-200
                      ${isDone ? 'bg-[var(--color-surface-pressed)]' : 'bg-[var(--color-surface)]'}
                    `}
                    aria-label={`${habit.name}${isDone ? ' — abgehakt' : ' — abhaken'}`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-base text-white flex-shrink-0"
                      style={{ backgroundColor: habit.color }}
                    >
                      {habit.emoji}
                    </div>
                    <span className={`flex-1 text-sm ${isDone ? 'text-[var(--color-text-secondary)] line-through' : 'text-[var(--color-text)]'}`}>
                      {habit.name}
                    </span>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      {streak && streak.current > 0 && (
                        <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                          {streak.current}×
                        </span>
                      )}
                      <div
                        className={`
                          w-7 h-7 rounded-full border-2 flex items-center justify-center
                          transition-all duration-200
                          ${isDone ? 'border-[var(--color-text)] bg-[var(--color-text)]' : 'border-[var(--color-border)]'}
                        `}
                      >
                        {isDone && (
                          <svg className="w-3.5 h-3.5 text-[var(--color-surface)] animate-[checkPop_0.2s_ease-out]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--color-border)] flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-[var(--color-text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </div>
      <p className="font-semibold text-base">{title}</p>
      <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-[220px]">{description}</p>
    </div>
  )
}
