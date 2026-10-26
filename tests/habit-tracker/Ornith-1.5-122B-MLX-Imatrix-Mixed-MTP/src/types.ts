export type ThemeMode = 'system' | 'light' | 'dark'

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: number
  order: number
}

export interface Completion {
  id: string // `${habitId}::${day}`
  habitId: string
  day: string
  ts: number
}

export interface Mood {
  id: string // day (YYYY-MM-DD)
  day: string
  value: number // 1..5
  note: string
  ts: number
}

export interface AppSettings {
  theme: ThemeMode
}

export function completionKey(habitId: string, day: string): string {
  return `${habitId}::${day}`
}
