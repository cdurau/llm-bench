export type Habit = {
  id: string
  name: string
  color: string
  emoji: string
  streak: number
  maxStreak: number
  createdAt: string
}

export type HabitLog = {
  id: string
  habitId: string
  completed: boolean
  date: string
}

export type MoodEntry = {
  id: string
  date: string
  value: 1 | 2 | 3 | 4 | 5
  note?: string
  createdAt: string
}

export type ThemePreference = {
  darkMode: boolean
}
