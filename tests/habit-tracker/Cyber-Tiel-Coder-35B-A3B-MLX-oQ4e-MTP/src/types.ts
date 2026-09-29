/** A habit the user wants to track. Dates are local `YYYY-MM-DD` keys. */
export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: string
  /** Ordering weight; lower comes first. */
  order: number
}

/** One dated completion of one habit. */
export interface Completion {
  habitId: string
  /** Local day key, `YYYY-MM-DD`. */
  date: string
}

/** A single mood check-in per day. */
export interface MoodEntry {
  /** Local day key, `YYYY-MM-DD`. */
  date: string
  /** 1 (low) … 5 (high). */
  mood: number
  note?: string
}

export type ThemePreference = 'system' | 'light' | 'dark'

export type TabId = 'today' | 'week' | 'settings'
