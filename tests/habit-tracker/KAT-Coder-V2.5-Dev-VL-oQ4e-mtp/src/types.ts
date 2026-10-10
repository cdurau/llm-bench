export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: number
}

export interface HabitLog {
  id: string
  habitId: string
  date: string // YYYY-MM-DD
  completed: boolean
}

export interface MoodLog {
  id: string
  date: string // YYYY-MM-DD
  mood: number // 1-5
  note?: string
}

export const HABIT_COLORS = [
  '#111111', // black (default)
  '#9F2F2D', // pale red
  '#1F6C9F', // pale blue
  '#346538', // pale green
  '#956400', // pale yellow
  '#6B4C8A', // muted purple
  '#8B5E3C', // warm brown
]

export const EMOJI_OPTIONS = [
  '💧', '🏃', '📖', '🧘', '🥗', '🎸', '✍️', '💊',
  '🧹', '🚿', '😴', '🥤', '🪥', '🌿', '⚡', '🎯'
]

export const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😊']
