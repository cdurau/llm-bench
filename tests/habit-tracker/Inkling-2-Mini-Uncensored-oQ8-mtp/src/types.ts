import type { HabitColorKey } from './lib/colors'

export type { HabitColorKey }

export interface Habit {
  id: string
  name: string
  emoji: string
  color: HabitColorKey
  createdAt: string
}

export interface Completion {
  id?: number
  habitId: string
  date: string // 'YYYY-MM-DD'
}

export interface MoodEntry {
  id?: number
  date: string // 'YYYY-MM-DD' (unique)
  mood: 1 | 2 | 3 | 4 | 5
  note?: string
}

export interface Settings {
  id: 'settings'
  theme: 'system' | 'light' | 'dark'
}

export const HABIT_EMOJIS = [
  '\u{1F3CB}\u{FE0F}', // 🏋️
  '\u{1F33F}',          // 🌿
  '\u{1F4D6}',          // 📖
  '\u{1F3C3}',          // 🏃
  '\u{1F9D8}',          // 🧘
  '\u{1F5B4}\u{FE0F}',  // 💧
  '\u{1F371}',          // 🥗
  '\u{1F634}',          // 😴
  '\u{2B50}',           // ⭐
  '\u{1F4DD}',          // 📝
  '\u{1F3A8}',          // 🎨
  '\u{1F9E0}',          // 🧠
  '\u{1F3B0}',          // 🎵
  '\u{1FA7A}',          // 🩺
  '\u{1F4AC}',          // 💬
  '\u{1F3AF}',          // 🎯
  '\u{1F4B0}',          // 💰
  '\u{1F4F1}'           // 📱
]
