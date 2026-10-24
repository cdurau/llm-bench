export type ThemeMode = 'system' | 'light' | 'dark'
export type EffectiveTheme = 'light' | 'dark'

export interface Habit {
  id: string
  name: string
  emoji: string
  colorId: string
  createdAt: string // ISO date (local day)
}

export interface Completion {
  id: string // `${habitId}_${date}`
  habitId: string
  date: string // YYYY-MM-DD (local day)
}

export interface Mood {
  date: string // YYYY-MM-DD
  value: number // 1..5
  note: string
}

export interface Settings {
  theme: ThemeMode
}

export interface Streaks {
  current: number
  longest: number
}

export interface StoreState {
  habits: Habit[]
  completions: Completion[]
  moods: Record<string, Mood> // keyed by date
  settings: Settings
  today: string
  effectiveTheme: EffectiveTheme
  ready: boolean
  // Derived helpers
  isDone(habitId: string, date: string): boolean
  completedDates(habitId: string): string[]
  streaks(habitId: string): Streaks
  // Actions
  addHabit(h: Omit<Habit, 'id' | 'createdAt'>): Promise<void>
  updateHabit(h: Habit): Promise<void>
  deleteHabit(id: string): Promise<void>
  toggle(habitId: string, date: string): Promise<void>
  setMood(date: string, value: number, note: string): Promise<void>
  setTheme(theme: ThemeMode): Promise<void>
}