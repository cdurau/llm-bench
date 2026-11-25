import { useState, useEffect } from 'react'
import { db } from './services/db'
import Header from './components/Header'
import TodayScreen from './components/TodayScreen'
import WeekScreen from './components/WeekScreen'
import SettingsScreen from './components/SettingsScreen'
import BottomNav from './components/BottomNav'

type Tab = 'today' | 'week' | 'settings'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const [habits, setHabits] = useState<any[]>([])
  const [moods, setMoods] = useState<any[]>([])
  const [darkMode, setDarkMode] = useState(false)

  // Load habits on mount
  useEffect(() => {
    loadInitialData()
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [])

  const loadInitialData = async () => {
    const storedHabits = await db.habits.toArray()
    const storedMoods = await db.moods.toArray()
    setHabits(storedHabits)
    setMoods(storedMoods)
  }

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled)
    if (enabled) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', enabled.toString())
  }

  const addHabit = async (name: string, emoji: string, color: string) => {
    const id = crypto.randomUUID()
    await db.habits.add({
      id,
      name,
      emoji,
      color,
      createdAt: new Date().toISOString()
    })
    setHabits(await db.habits.toArray())
  }

  const updateHabit = async (id: string, name: string, emoji: string, color: string) => {
    await db.habits.update(id, { name, emoji, color })
    setHabits(await db.habits.toArray())
  }

  const deleteHabit = async (id: string) => {
    await db.habits.delete(id)
    setHabits(await db.habits.toArray())
  }

  const toggleHabit = async (id: string, date: string) => {
    const existing = await db.completions
      .where({ habitId: id, date })
      .first()

    if (existing) {
      await db.completions.delete(existing.id)
    } else {
      await db.completions.add({ id: crypto.randomUUID(), habitId: id, date, completedAt: new Date().toISOString() })
    }
  }

  const addMood = async (value: number, note?: string) => {
    const id = crypto.randomUUID()
    await db.moods.add({
      id,
      value,
      note,
      date: new Date().toISOString()
    })
    setMoods(await db.moods.toArray())
  }

  const updateMood = async (id: string, value: number, note?: string) => {
    await db.moods.update(id, { value, note })
    setMoods(await db.moods.toArray())
  }

  const stats = {
    todayHabits: habits.filter(async h => {
      const today = new Date().toISOString().split('T')[0]
      const completions = await db.completions.where({ habitId: h.id, date: today }).toArray()
      return completions.length > 0
    }).length,
    totalHabits: habits.length
  }

  const completedToday = habits.filter(async h => {
    const today = new Date().toISOString().split('T')[0]
    const completions = await db.completions.where({ habitId: h.id, date: today }).toArray()
    return completions.length > 0
  }).length

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="max-w-md mx-auto px-4 py-6 pb-28">
        <Header
          title="Rhythm"
          darkMode={darkMode}
          onToggleDarkMode={() => toggleDarkMode(!darkMode)}
        />

        {activeTab === 'today' && (
          <TodayScreen
            habits={habits}
            moods={moods.filter(m => {
              const today = new Date().toISOString().split('T')[0]
              return m.date.startsWith(today)
            })}
            stats={stats}
            completedToday={completedToday}
            onToggleHabit={toggleHabit}
            onEditHabit={updateHabit}
            onDeleteHabit={deleteHabit}
            onAddMood={addMood}
            onUpdateMood={updateMood}
          />
        )}

        {activeTab === 'week' && (
          <WeekScreen habits={habits} />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            habits={habits}
            darkMode={darkMode}
            onToggleDarkMode={() => toggleDarkMode(darkMode)}
            onAddHabit={addHabit}
            onEditHabit={updateHabit}
            onDeleteHabit={deleteHabit}
          />
        )}
      </div>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}

export default App
