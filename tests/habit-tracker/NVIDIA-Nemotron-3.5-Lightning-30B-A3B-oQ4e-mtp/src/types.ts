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

export interface AppState {
  habits: Habit[]
  mood: number | null
  moodNotes: string
  theme: 'light' | 'dark'
  selectedDate: string
}
