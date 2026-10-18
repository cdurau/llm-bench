import { useState, useEffect } from 'react'
import { getWeeklyData, getHabits, formatDateGerman, type DailyCounts, type Habit } from '../db'

const WEEKDAY_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
const MOOD_EMOJIS = ['', '😞', '😕', '😐', '🙂', '😊']

export default function WeekScreen() {
  const [data, setData] = useState<DailyCounts[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([getWeeklyData(), getHabits()]).then(([d, h]) => {
      if (mounted) { setData(d); setHabits(h); setLoading(false) }
    })
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col flex-1 overflow-y-auto px-5 pt-14 pb-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Übersicht</p>
        <h2 className="text-2xl font-bold tracking-tight mt-1 text-[var(--color-text)]">Woche</h2>
        <div className="h-48 bg-[var(--color-border)] rounded-xl mt-5 animate-pulse" />
      </div>
    )
  }

  const hasAnyData = data.some(d => d.completed.length > 0 || d.mood)
  if (!hasAnyData) {
    return (
      <EmptyState title="Noch keine Daten" description="Lege Habits an und trage täglich deine Stimmung ein." />
    )
  }

  const maxHabits = habits.length || 1
  const maxMood = 5

  const getMoodColor = (value: number): string => {
    if (value <= 2) return '#c4956a'
    if (value === 3) return '#8a9a8a'
    return '#7a9cc4'
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="px-5 pt-14 pb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
          {formatDateGerman(data[6].date)} — {formatDateGerman(data[0].date)}
        </p>
        <h2 className="text-3xl font-bold tracking-tight mt-1 text-[var(--color-text)]">Woche</h2>
      </div>

      <div className="px-5 flex-1 pb-24 space-y-5">
        {/* Completed chart */}
        <div className="bg-[var(--color-surface)] rounded-xl p-4">
          <h3 className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest mb-3">
            Erledigte Habits
          </h3>
          <div className="flex items-end gap-1.5 h-28">
            {data.map((d) => {
              const height = (d.completed.length / maxHabits) * 100
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  {d.completed.length > 0 && (
                    <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">{d.completed.length}</span>
                  )}
                  <div
                    className="w-full bg-[var(--color-text)] rounded-t-md transition-all duration-500"
                    style={{ height: `${Math.max(height, 6)}%`, opacity: d.completed.length === 0 ? 0.15 : 0.75 }}
                  />
                  <span className="text-[9px] text-[var(--color-text-tertiary)]">
                    {WEEKDAY_SHORT[new Date(d.date).getDay()]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mood chart */}
        <div className="bg-[var(--color-surface)] rounded-xl p-4">
          <h3 className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest mb-3">
            Stimmung
          </h3>
          <div className="flex items-end gap-1.5 h-28">
            {data.map((d) => {
              const moodH = d.mood ? (d.mood.value / maxMood) * 100 : 0
              const moodEntry = d.mood
              const bgColor = moodEntry ? getMoodColor(moodEntry.value) : undefined
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  {moodEntry ? (
                    <span className="text-base">{MOOD_EMOJIS[moodEntry.value]}</span>
                  ) : (
                    <span className="h-4" />
                  )}
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${moodEntry ? Math.max(moodH, 6) : 6}%`,
                      backgroundColor: bgColor || 'var(--color-border)',
                      opacity: moodEntry ? 0.75 : 0.1,
                    }}
                  />
                  <span className="text-[9px] text-[var(--color-text-tertiary)]">
                    {WEEKDAY_SHORT[new Date(d.date).getDay()]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Day details */}
        <div className="space-y-1.5">
          {[...data].reverse().map(d => (
            <div key={d.date} className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text)] font-medium">
                {formatDateGerman(d.date)}
              </span>
              <span className="text-[var(--color-text-secondary)]">
                {d.completed.length}/{maxHabits} Habits
                {d.mood ? ` · ${MOOD_EMOJIS[d.mood.value]}` : ' · keine Stimmung'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--color-border)] flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-[var(--color-text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 15l4-4 3 3 4-5 7 7" />
        </svg>
      </div>
      <p className="font-semibold text-base">{title}</p>
      <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-[220px]">{description}</p>
    </div>
  )
}
