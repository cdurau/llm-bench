export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: string
}

export interface Completion {
  id: string
  habitId: string
  date: string
  completedAt: string
}

export interface Mood {
  id: string
  value: number // 1-5
  note?: string
  date: string
}

export interface HabitStats {
  id: string
  habitId: string
  currentStreak: number
  longestStreak: number
  lastCompletionDate: string | null
}
