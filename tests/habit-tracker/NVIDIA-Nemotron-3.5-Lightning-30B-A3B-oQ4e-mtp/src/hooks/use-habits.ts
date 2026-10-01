import { useState, useEffect, useCallback } from 'react'

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  streakCurrent: number
  streakLongest: number
  completedToday: boolean
  mood?: number
  moodNotes?: string
  lastCompleted?: string | null
}

export interface MoodEntry {
  date: string
  mood: number
  notes?: string
}

export interface HabitsState {
  habits: Habit[]
  mood: number | null
  moodNotes: string
  theme: 'light' | 'dark'
  selectedDate: string
}

export interface HabitsActions {
  addHabit: (name: string, emoji: string, color: string) => void
  removeHabit: (id: string) => void
  toggleHabit: (id: string) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  setMood: (mood: number, notes?: string) => void
  clearMood: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setSelectedDate: (date: string) => void
}

export const useHabits = (): [HabitsState, HabitsActions] => {
  const [state, setState] = useState<HabitsState>(() => {
    const saved = localStorage.getItem('habit-tracker-state')
    if (saved) return JSON.parse(saved)
    return {
      habits: [],
      mood: null,
      moodNotes: '',
      theme: 'light',
      selectedDate: new Date().toISOString().split('T')[0]
    }
  })

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem('habit-tracker-state', JSON.stringify(state))
  }, [state])

  const addHabit = useCallback((name: string, emoji: string, color: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      emoji,
      color,
      streakCurrent: 0,
      streakLongest: 0,
      completedToday: false
    }
    setState(prev => ({
      ...prev,
      habits: [...prev.habits, newHabit]
    }))
  }, [])

  const removeHabit = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id)
    }))
  }, [])

  const toggleHabit = useCallback((id: string) => {
    setState(prev => {
      const habit = prev.habits.find(h => h.id === id)
      if (!habit) return prev

      const today = new Date().toISOString().split('T')[0]
      const wasCompletedToday = habit.completedToday
      const dateCompleted = habit.lastCompleted

      // Check if already completed today
      if (dateCompleted === today) {
        // Already completed today, don't change
        return prev
      }

      const completedToday = !habit.completedToday
      const newStreakCurrent = habit.completedToday
        ? habit.streakCurrent - 1
        : habit.streakCurrent + 1

      // Update longest streak if needed
      const newStreakLongest = Math.max(habit.streakLongest, newStreakCurrent)

      // Find the habit and update it
      const updatedHabits = prev.habits.map(h =>
        h.id === id
          ? {
              ...h,
              completedToday,
              streakCurrent: newStreakCurrent,
              streakLongest: newStreakLongest,
              lastCompleted: completedToday ? today : habit.lastCompleted
            }
          : h
      )

      return {
        ...prev,
        habits: updatedHabits
      }
    })
  }, [])

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setState(prev =>
      prev.habits.map(h =>
        h.id === id ? { ...h, ...updates } : h
      )
    )
  }, [])

  const setMood = useCallback((mood: number, notes?: string) => {
    setState(prev => ({
      ...prev,
      mood,
      moodNotes: notes || ''
    }))
  }, [])

  const clearMood = useCallback(() => {
    setState(prev => ({
      ...prev,
      mood: null,
      moodNotes: ''
    }))
  }, [])

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setState(prev => ({
      ...prev,
      theme: theme
    }))
  }, [])

  const setSelectedDate = useCallback((date: string) => {
    setState(prev => ({
      ...prev,
      selectedDate: date
    }))
  }, [])

  return [state, {
    addHabit,
    removeHabit,
    toggleHabit,
    updateHabit,
    setMood,
    clearMood,
    setTheme,
    setSelectedDate
  }]
}
