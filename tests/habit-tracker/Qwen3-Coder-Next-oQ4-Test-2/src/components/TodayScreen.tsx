import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTodayHabits, setHabitStatus, calculateStreaks } from '../db'
import type { Habit } from '../db'
import './App.css'

export default function TodayScreen() {
  const navigate = useNavigate()
  const [habits, setHabits] = useState<(Habit & { completed: boolean })[]>([])
  const [loading, setLoading] = useState(true)
  
  // Aktuelle Habits laden
  const loadHabits = useCallback(async () => {
    try {
      const loadedHabits = await getTodayHabits()
      setHabits(loadedHabits)
    } catch (error) {
      console.error('Fehler beim Laden der Habits:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    loadHabits()
  }, [loadHabits])
  
  // Fortschritt berechnen
  const progress = habits.reduce((acc, habit) => acc + (habit.completed ? 1 : 0), 0)
  const total = habits.length
  
  // Habit abhaken/abhaken
  const toggleHabit = async (habitId: string, currentStatus: boolean) => {
    try {
      const date = new Date().toISOString().split('T')[0]
      await setHabitStatus(habitId, date, !currentStatus)
      await loadHabits()
    } catch (error) {
      console.error('Fehler beim Ändern des Status:', error)
    }
  }
  
  // Navigiere zur Einstellungen zum Hinzufügen
  const handleAddHabit = () => {
    navigate('/settings?openModal=true')
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-text-secondary">Laden...</div>
      </div>
    )
  }
  
  return (
    <div className="p-4 space-y-6">
      {/* Header mit Datum und Fortschritt */}
      <header className="mb-6">
        <div className="text-4xl font-bold text-text mb-2">
          {new Date().toLocaleDateString('de-DE', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </div>
        <div 
          data-testid="progress"
          className="text-2xl font-semibold text-accent"
        >
          {total > 0 ? `${progress} von ${total}` : '0 von 0'}
        </div>
      </header>
      
      {/* Habits Liste */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="empty-state">
            <div className="text-6xl mb-4">✊</div>
            <h3 className="text-xl font-semibold mb-2">Keine Habits</h3>
            <p>Erstelle dein erstes Habit und starte durch!</p>
            <button
              data-testid="empty-state-habit-add"
              onClick={handleAddHabit}
              className="mt-6 btn btn-primary"
            >
              + Habit hinzufügen
            </button>
          </div>
        ) : (
          habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onToggle={() => toggleHabit(habit.id, habit.completed)}
            />
          ))
        )}
      </div>
      
      {/* Add Habit Button */}
      <button
        data-testid="habit-add"
        onClick={handleAddHabit}
        className="w-full btn btn-primary"
      >
        + weiteres Habit
      </button>
    </div>
  )
}

// Einzelnes Habit Item
interface HabitItemProps {
  habit: Habit & { completed: boolean }
  onToggle: () => void
}

function HabitItem({ habit, onToggle }: HabitItemProps) {
  const [streaks, setStreaks] = useState({ current: 0 })
  
  useEffect(() => {
    calculateStreaks(habit.id).then(setStreaks)
  }, [habit.id, habit.completed])
  
  return (
    <div
      data-testid="habit-item"
      className={`flex items-center justify-between p-4 rounded-3xl border-2 transition-all duration-300 ${
        habit.completed 
          ? 'border-border bg-surface opacity-60' 
          : 'border-transparent bg-surface hover:shadow-soft'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Habit Icon/Emoji */}
        <div className="text-3xl select-none">{habit.emoji}</div>
        
        <div>
          <div className="font-semibold text-lg">{habit.name}</div>
          <div 
            data-testid="habit-streak"
            className="text-sm text-text-secondary flex items-center gap-2"
          >
            <span className="flex items-center gap-1">
              🔥 {streaks.current}
            </span>
            <span className="opacity-50">•</span>
            <span className="flex items-center gap-1">
              🏆 {streaks.current + 1}
            </span>
          </div>
        </div>
      </div>
      
      {/* Toggle Button */}
      <button
        data-testid="habit-toggle"
        type="button"
        onClick={onToggle}
        aria-pressed={habit.completed}
        className={`relative z-50 w-14 h-8 rounded-full p-1 transition-all duration-300 ${
          habit.completed ? 'bg-accent' : 'bg-border'
        }`}
      >
        <div 
          className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
            habit.completed ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
