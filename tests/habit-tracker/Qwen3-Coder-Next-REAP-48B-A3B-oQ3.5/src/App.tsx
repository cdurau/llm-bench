import { useState, useEffect, useMemo } from 'react'
import * as db from './db'
import type { Habit } from './types'
import { HabitsProvider, type HabitsContextValue } from './HabitContext'
import { HabitItem } from './HabitItem'
import { HabitModal } from './HabitModal'
import WeekScreen from './WeekScreen'
import SettingsScreen from './SettingsScreen'

// Habit colors following minimalist-ui patterns
const habitColors = [
  'bg-rose-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-pink-500',
]

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'settings'>('today')
  const [showHabitModal, setShowHabitModal] = useState(false)
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitColor, setNewHabitColor] = useState(habitColors[0])

  useEffect(() => {
    db.getHabits().then((habits) => {
      setHabits(habits)
      setLoading(false)
    })
  }, [])

  const handleAddHabit = async () => {
    if (newHabitName.trim()) {
      try {
        const habitId = await db.addHabit({
          name: newHabitName.trim(),
          color: newHabitColor,
          emoji: '🟡',
        })
        setNewHabitName('')
        setShowHabitModal(false)
        // Refresh habits list
        const updatedHabits = await db.getHabits()
        setHabits(updatedHabits)
      } catch (error) {
        console.error('Failed to add habit:', error)
      }
    }
  }

  const handleToggleHabit = async (habitId: string) => {
    try {
      const habit = habits.find((h) => h.id === habitId)
      if (habit) {
        // Toggle logic: if currently checked, uncheck, and vice versa
        const logs = await db.getHabitLogsByDate(db.formatDate(new Date()))
        const existingLog = logs.find((l: any) => l.habitId === habitId)
        const newCompleted = !existingLog?.completed
        await db.logHabitCompleted(habitId, newCompleted)
        // Refresh habits to get updated streak
        const updatedHabits = await db.getHabits()
        setHabits(updatedHabits)
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error)
    }
  }

  const HabitContextValue = useMemo(
    (): HabitsContextValue => ({
      habits,
      setHabits,
    }),
    [habits]
  )

  return (
    <HabitsProvider>
      <div className="min-h-screen bg-surface dark:bg-surface-dark text-text dark:text-text-dark transition-colors">
        <main className="max-w-md mx-auto px-4 pb-20">
          {activeTab === 'today' && (
            <TodayScreen
              habits={habits}
              loading={loading}
              onAddHabit={() => setShowHabitModal(true)}
              onHabitToggle={handleToggleHabit}
            />
          )}
          {activeTab === 'week' && <WeekScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-dark border-t border-border dark:border-border-dark z-10">
          <div className="flex justify-around items-center h-16">
            <button
              data-testid="nav-today"
              onClick={() => setActiveTab('today')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === 'today' ? 'text-accent' : ''
              }`}
            >
              <span className="text-lg font-semibold">📅</span>
              <span className="text-xs">Heute</span>
            </button>
            <button
              data-testid="nav-week"
              onClick={() => setActiveTab('week')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === 'week' ? 'text-accent' : ''
              }`}
            >
              <span className="text-lg font-semibold">📊</span>
              <span className="text-xs">Woche</span>
            </button>
            <button
              data-testid="nav-settings"
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === 'settings' ? 'text-accent' : ''
              }`}
            >
              <span className="text-lg font-semibold">⚙️</span>
              <span className="text-xs">Einst.</span>
            </button>
          </div>
        </nav>

        <HabitModal
          show={showHabitModal}
          onClose={() => setShowHabitModal(false)}
          habit={{
            name: newHabitName,
            color: newHabitColor,
            emoji: '🟡',
          }}
          onSave={handleAddHabit}
          onChange={(field, value) => {
            if (field === 'name') setNewHabitName(value)
            if (field === 'color') setNewHabitColor(value)
          }}
        />
      </div>
    </HabitsProvider>
  )
}

function TodayScreen({
  habits,
  loading,
  onAddHabit,
  onHabitToggle,
}: {
  habits: Habit[]
  loading: boolean
  onAddHabit: () => void
  onHabitToggle: (habitId: string) => void
}) {
  // Calculate completed count
  const [completedCount, setCompletedCount] = useState(0)

  return (
    <div className="py-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Heute</h1>
        <p className="text-lg opacity-70">
          {new Date().toLocaleDateString('de-DE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </header>

      <div className="mb-6">
        <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 shadow-lg">
          <p className="text-2xl font-medium mb-1" data-testid="progress">
            {habits.length > 0 ? `${completedCount} von ${habits.length}` : '0 von 0'} Habits
          </p>
          <p className="text-sm opacity-60">Keep up your good work!</p>
        </div>
      </div>

      <div className="space-y-4">
        {habits.length === 0 ? (
          <EmptyState onAddHabit={onAddHabit} />
        ) : (
          habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onToggle={() => onHabitToggle(habit.id)}
            />
          ))
        )}
      </div>

      <button
        data-testid="habit-add"
        onClick={onAddHabit}
        className="mt-8 w-full py-4 bg-accent dark:bg-accent-dark text-white rounded-2xl shadow-lg active:scale-95 transition-transform"
      >
        <span className="text-xl font-semibold">+ Add Habit</span>
      </button>
    </div>
  )
}

function EmptyState({ onAddHabit }: { onAddHabit: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🌱</div>
      <h2 className="text-2xl font-bold mb-2">No Habits yet</h2>
      <p className="opacity-70 mb-6">
        Add your first habit to start tracking the progress
      </p>
      <button
        data-testid="habit-add-empty"
        onClick={onAddHabit}
        className="px-6 py-3 bg-accent dark:bg-accent-dark text-white rounded-xl shadow-lg"
      >
        Create Habit
      </button>
    </div>
  )
}
