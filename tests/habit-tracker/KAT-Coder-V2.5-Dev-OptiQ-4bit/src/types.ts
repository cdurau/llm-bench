export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: number
}

export interface HabitCompletion {
  id?: number
  habitId: string
  date: string // YYYY-MM-DD
}

export interface MoodEntry {
  date: string // YYYY-MM-DD
  value: number // 1-5
  note?: string
}
