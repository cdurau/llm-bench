export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: number
}

export interface HabitCompletion {
  id: string
  date: string // YYYY-MM-DD
  habitId: string
}

export interface MoodEntry {
  date: string // YYYY-MM-DD
  value: number // 1–5
  note?: string
}

export type TabId = 'today' | 'week' | 'settings'

export interface AppState {
  habits: Habit[]
  completions: HabitCompletion[]
  moods: MoodEntry[]
  darkMode: boolean
}
