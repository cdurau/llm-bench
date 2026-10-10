import { useState, useEffect, useRef } from 'react'
import { Habit, HabitLog, MoodLog } from '../types'
import { getStreak } from '../db'

interface TodayProps {
  habits: Habit[]
  logs: HabitLog[]
  mood: MoodLog | null
  onToggleHabit: (habitId: string, date: string) => void
  onSetMood: (m: number, note?: string) => void
  dark: boolean
  onToggleDark: () => void
  onDataLoad: () => void
}

const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😊']

export default function Today({ habits, logs, mood, onToggleHabit, onSetMood, dark, onToggleDark, onDataLoad }: TodayProps) {
  const [note, setNote] = useState('')
  const [editingNote, setEditingNote] = useState(false)
  const [animatingId, setAnimatingId] = useState<string | null>(null)
  const noteRef = useRef<HTMLTextAreaElement>(null)

  const todayStr = new Date().toISOString().split('T')[0]
  const streaks = getStreak(habits, logs)

  const completedCount = logs.filter(l => l.completed).length
  const progress = habits.length > 0 ? `${completedCount} von ${habits.length}` : ''

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const handleToggle = (habitId: string) => {
    setAnimatingId(habitId)
    onToggleHabit(habitId, todayStr)
    setTimeout(() => setAnimatingId(null), 300)
  }

  const handleMoodSelect = (m: number, n?: string) => {
    onSetMood(m, n || note || undefined)
  }

  useEffect(() => {
    if (editingNote && noteRef.current) {
      noteRef.current.focus()
    }
  }, [editingNote])

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111] dark:text-white">
            {formatDate(todayStr)}
          </h1>
          {habits.length > 0 && (
            <p className="mt-1 text-sm text-[#787774]">{progress}</p>
          )}
        </div>
        <button
          onClick={onToggleDark}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#EAEAEA] dark:border-white/10 text-[#787774] hover:bg-[#F7F6F3] dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
          aria-label={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </header>

      {/* Habits */}
      {habits.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {habits.map((habit, i) => {
            const log = logs.find(l => l.habitId === habit.id && l.date === todayStr)
            const completed = log?.completed ?? false
            const streak = streaks[habit.id]
            const isAnimating = animatingId === habit.id

            return (
              <div
                key={habit.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                  completed
                    ? 'border-[#EAEAEA] dark:border-white/10 bg-[#F7F6F3] dark:bg-white/5 opacity-70'
                    : 'border-[#EAEAEA] dark:border-white/10 bg-white dark:bg-[#1A1A1A]'
                } ${isAnimating ? 'scale-95' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <button
                  onClick={() => handleToggle(habit.id)}
                  className={`w-8 h-8 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white ${
                    completed
                      ? 'bg-[#111111] dark:bg-white border-[#111111] dark:border-white'
                      : 'border-[#EAEAEA] dark:border-white/20 hover:border-[#111111] dark:hover:border-white'
                  }`}
                  aria-label={`${habit.name} ${completed ? 'abhaken' : 'als erledigt markieren'}`}
                >
                  {completed && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{habit.emoji}</span>
                    <span className={`font-medium truncate ${completed ? 'text-[#787774] line-through' : 'text-[#111111] dark:text-white'}`}>
                      {habit.name}
                    </span>
                  </div>
                  {streak.current > 0 && (
                    <p className="text-xs text-[#787774] mt-0.5">
                      {streak.current} Tage · Lang: {streak.longest}
                    </p>
                  )}
                </div>

                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: habit.color }}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Mood */}
      <section>
        <h2 className="text-sm font-medium text-[#787774] uppercase tracking-wider mb-3">Stimmung</h2>
        {mood ? (
          <div className="p-4 rounded-xl border border-[#EAEAEA] dark:border-white/10 bg-white dark:bg-[#1A1A1A]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{MOOD_EMOJIS[mood.mood - 1]}</span>
              <div className="flex-1">
                <p className="font-medium text-[#111111] dark:text-white">
                  {MOOD_EMOJIS[mood.mood - 1]} {mood.mood}. Stimmung
                </p>
                {mood.note && (
                  <p className="text-sm text-[#787774] mt-1">{mood.note}</p>
                )}
              </div>
              <button
                onClick={() => setEditingNote(true)}
                className="text-sm text-[#787774] hover:text-[#111111] dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white px-2 py-1 rounded"
              >
                Ändern
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-[#EAEAEA] dark:border-white/10 bg-white dark:bg-[#1A1A1A]">
            <p className="text-sm text-[#787774] mb-3">Wie war dein Tag?</p>
            <div className="flex gap-2">
              {MOOD_EMOJIS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleMoodSelect(i + 1)}
                  className="w-11 h-11 flex items-center justify-center text-xl rounded-lg border border-[#EAEAEA] dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
                  aria-label={`Stimmung ${i + 1}: ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {mood && editingNote && (
          <div className="mt-3 p-4 rounded-xl border border-[#EAEAEA] dark:border-white/10 bg-white dark:bg-[#1A1A1A]">
            <textarea
              ref={noteRef}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Notiz (optional)..."
              rows={2}
              className="w-full text-sm bg-transparent border-none outline-none resize-none text-[#111111] dark:text-white placeholder-[#787774]"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => { handleMoodSelect(mood.mood, note); setEditingNote(false) }}
                className="px-3 py-1.5 text-sm bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
              >
                Speichern
              </button>
              <button
                onClick={() => { setNote(''); setEditingNote(false) }}
                className="px-3 py-1.5 text-sm text-[#787774] hover:text-[#111111] dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <p className="text-[#787774] text-sm">Noch keine Habits.</p>
      <p className="text-[#787774] text-sm mt-1">Füge in den Einstellungen deine ersten Habits hinzu.</p>
    </div>
  )
}
