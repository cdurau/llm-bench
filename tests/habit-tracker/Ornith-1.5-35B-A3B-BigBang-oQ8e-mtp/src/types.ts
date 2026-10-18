export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: number
}

export interface MoodEntry {
  date: string
  value: number
  note: string
}

export interface Completion {
  habitId: string
  date: string
}
