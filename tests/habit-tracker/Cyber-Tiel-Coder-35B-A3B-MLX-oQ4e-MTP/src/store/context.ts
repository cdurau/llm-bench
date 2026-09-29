import { createContext, useContext } from 'react'
import type { Habit, MoodEntry } from '../types'

export interface NewHabit {
  name: string
  emoji: string
  color: string
}

export interface RhythmContextValue {
  habits: Habit[]
  moods: MoodEntry[]
  loading: boolean
  isDone: (habitId: string, date: string) => boolean
  datesFor: (habitId: string) => string[]
  moodFor: (date: string) => MoodEntry | undefined
  addHabit: (input: NewHabit) => Promise<Habit>
  updateHabit: (id: string, patch: Partial<NewHabit>) => Promise<void>
  removeHabit: (id: string) => Promise<void>
  toggle: (habitId: string, date: string) => Promise<void>
  saveMood: (date: string, mood: number, note?: string) => Promise<void>
  clearMood: (date: string) => Promise<void>
}

export const RhythmContext = createContext<RhythmContextValue | null>(null)

export function useRhythm(): RhythmContextValue {
  const context = useContext(RhythmContext)
  if (!context) {
    throw new Error('useRhythm muss innerhalb von RhythmProvider verwendet werden')
  }
  return context
}
