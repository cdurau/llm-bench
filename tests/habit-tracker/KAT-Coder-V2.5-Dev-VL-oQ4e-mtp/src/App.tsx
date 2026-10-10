import { useState, useEffect, useCallback } from 'react'
import Today from './components/Today'
import Week from './components/Week'
import Settings from './components/Settings'
import { getAllHabits, getAllLogsForDate, getMoodForDate, saveHabitLog, saveMoodLog, getLogForDate, getAllMoodLogs } from './db'
import { Habit, HabitLog, MoodLog } from './types'

type Tab = 'today' | 'week' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [mood, setMood] = useState<MoodLog | null>(null)
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([])
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('rhythm-dark')
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const todayStr = new Date().toISOString().split('T')[0]

  const loadData = useCallback(async () => {
    const [h, l, m, ml] = await Promise.all([
      getAllHabits(),
      getAllLogsForDate(todayStr),
      getMoodForDate(todayStr),
      getAllMoodLogs()
    ])
    setHabits(h)
    setLogs(l)
    setMood(m)
    setMoodLogs(ml)
  }, [todayStr])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('rhythm-dark', String(dark))
  }, [dark])

  const toggleHabit = async (habitId: string, date: string) => {
    const existing = await getLogForDate(habitId, date)
    const newCompleted = !existing?.completed
    const log: HabitLog = {
      id: `${habitId}-${date}`,
      habitId,
      date,
      completed: newCompleted
    }
    await saveHabitLog(log)
    setLogs(prev => {
      const filtered = prev.filter(l => !(l.habitId === habitId && l.date === date))
      return [...filtered, log]
    })
  }

  const setMoodEntry = async (m: number, note?: string) => {
    const log: MoodLog = {
      id: `mood-${todayStr}`,
      date: todayStr,
      mood: m,
      note
    }
    await saveMoodLog(log)
    setMood(log)
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0E0E0E] text-[#111111] dark:text-[#F0F0F0] transition-colors duration-200">
      <div className="max-w-md mx-auto px-4 pb-24 pt-6">
        {activeTab === 'today' && (
          <Today
            habits={habits}
            logs={logs}
            mood={mood}
            onToggleHabit={toggleHabit}
            onSetMood={setMoodEntry}
            dark={dark}
            onToggleDark={() => setDark(d => !d)}
            onDataLoad={loadData}
          />
        )}
        {activeTab === 'week' && <Week habits={habits} logs={logs} moodLogs={moodLogs} />}
        {activeTab === 'settings' && (
          <Settings
            habits={habits}
            onReload={loadData}
          />
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-lg border-t border-[#EAEAEA] dark:border-white/10">
        <div className="max-w-md mx-auto flex">
          <TabButton active={activeTab === 'today'} onClick={() => setActiveTab('today')} label="Heute" />
          <TabButton active={activeTab === 'week'} onClick={() => setActiveTab('week')} label="Woche" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Einstellungen" />
        </div>
      </nav>
    </div>
  )
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white`}
      aria-label={label}
    >
      <span className={`block text-center ${active ? 'text-[#111111] dark:text-white' : 'text-[#787774]'}`}>
        {label}
      </span>
    </button>
  )
}
