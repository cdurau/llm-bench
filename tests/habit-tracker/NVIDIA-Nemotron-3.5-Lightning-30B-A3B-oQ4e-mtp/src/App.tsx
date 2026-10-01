import React, { useState, useEffect } from 'react'
import { useHabits } from './hooks/use-habits'
import { NavTab } from './components/NavTab'
import { HabitItem } from './components/HabitItem'
import { MoodButtons } from './components/MoodButtons'
import { HabitAddForm } from './components/HabitAddForm'
import { WeeklyChart } from './components/WeeklyChart'
import './index.css'

export default function App() {
  const [state, actions] = useHabits()
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'settings'>('today')
  const [showAddHabit, setShowAddHabit] = useState(false)

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initialTheme = storedTheme || (prefersDark.matches ? 'dark' : 'light')
    actions.setTheme(initialTheme)
    const handler = () => actions.setTheme(prefersDark.matches ? 'dark' : 'light')
    prefersDark.addEventListener('change', handler)
    return () => prefersDark.removeEventListener('change', handler)
  }, [actions])

  const handleAddHabit = (name: string, emoji: string, color: string) => {
    actions.addHabit(name, emoji, color)
    setShowAddHabit(false)
  }

  const handleToggleHabit = (id: string) => actions.toggleHabit(id)
  const handleSetMood = (mood: number, notes: string) => actions.setMood(mood, notes)
  const handleClearMood = () => actions.clearMood()
  const handleSetTheme = (theme: 'light' | 'dark') => actions.setTheme(theme)
  const handleSetSelectedDate = (date: string) => actions.setSelectedDate(date)

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <header className="mb-6">
        <div className="mb-4">
          <div className="text-lg font-semibold text-foreground mb-2">
            Fortschritt heute
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              {state.habits.filter(h => h.completedToday).length} von {state.habits.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Habits erledigt
            </span>
          </div>
        </div>
        <NavTab active={activeTab} onClick={setActiveTab} />
        <div className="mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Stimmung wählen:
          </div>
          <div className="flex gap-1">
            <MoodButtons
              selected={state.mood}
              onSelect={handleSetMood}
              onClear={handleClearMood}
            />
          </div>
        </div>
      </header>
      <main className="mt-4 grid gap-4">
        {activeTab === 'today' && <TodayScreen state={state} actions={actions} />}
        {activeTab === 'week' && <WeeklyChartScreen state={state} actions={actions} />}
        {activeTab === 'settings' && <SettingsScreen actions={actions} />}
      </main>
    </div>
  )
}

const TodayScreen: React.FC = ({ state, actions }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-4">Heute</h2>
      {state.habits.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a4 4 0 01-4 4H5a4 4 0 01-4-4V5a4 4 0 014-4h5" />
          </svg>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Keine Habits definiert. Füge oben welche hinzu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {state.habits.map((habit: any) => (
            <HabitItem
              key={habit.id}
              habit={ habit }
              onToggle={() => actions.toggleHabit(habit.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const WeeklyChartScreen: React.FC = ({ state, actions }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-4">Woche</h2>
      <div className="mt-4">
        <WeeklyChart habits={state.habits} />
      </div>
    </div>
  )
}

const SettingsScreen: React.FC = ({ actions }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-4">Einstellungen</h2>
      <div className="mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Thema:
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleSetTheme('light')}
          >
            Hell
          </button>
          <button
            className="px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleSetTheme('dark')}
          >
            Dunkel
          </button>
        </div>
      </div>
      <HabitAddForm onSubmit={handleAddHabit} show={showAddHabit} setShow={setShowAddHabit} />
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Alle Daten werden lokal im Browser gespeichert. Sie sind offlinefähig.
        </p>
      </div>
    </div>
  )
}
