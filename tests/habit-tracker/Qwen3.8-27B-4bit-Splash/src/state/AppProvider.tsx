// Zentraler App-Zustand: lädt die drei Stores und hält sie in Sync.
// Mutations schreiben zuerst nach IndexedDB und spiegeln den Erfolg lokal.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as db from '../lib/db'
import type { Completion, Habit, HabitColorKey, MoodEntry, MoodValue } from '../lib/db'
import { computeStreaks, type Streaks } from '../lib/streaks'

interface AppState {
  habits: Habit[]
  completions: Completion[]
  moods: MoodEntry[]
  loaded: boolean
}

interface AppContextValue extends AppState {
  addHabit: (name: string, emoji: string, color: HabitColorKey) => Promise<void>
  updateHabit: (id: string, patch: Partial<Pick<Habit, 'name' | 'emoji' | 'color'>>) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  toggleCompletion: (habitId: string, date: string) => Promise<void>
  setMood: (date: string, value: MoodValue, note: string) => Promise<void>
  clearAllData: () => Promise<void>
  isDone: (habitId: string, date: string) => boolean
  habitStreaks: (habitId: string) => Streaks
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    habits: [],
    completions: [],
    moods: [],
    loaded: false,
  })

  useEffect(() => {
    let active = true
    Promise.all([db.getAllHabits(), db.getAllCompletions(), db.getAllMoods()])
      .then(([habits, completions, moods]) => {
        if (!active) return
        setState({
          habits: [...habits].sort((a, b) => a.createdAt - b.createdAt),
          completions,
          moods,
          loaded: true,
        })
      })
      .catch(() => {
        if (active) {
          setState((s) => ({ ...s, loaded: true }))
        }
      })
    return () => {
      active = false
    }
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,

      async addHabit(name, emoji, color) {
        const habit: Habit = {
          id: crypto.randomUUID(),
          name,
          emoji,
          color,
          createdAt: Date.now(),
        }
        await db.putHabit(habit)
        setState((s) => ({ ...s, habits: [...s.habits, habit] }))
      },

      async updateHabit(id, patch) {
        setState((s) => ({
          ...s,
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        }))
        const existing = state.habits.find((h) => h.id === id)
        if (existing) {
          await db.putHabit({ ...existing, ...patch })
        }
      },

      async deleteHabit(id) {
        setState((s) => ({
          ...s,
          habits: s.habits.filter((h) => h.id !== id),
          completions: s.completions.filter((c) => c.habitId !== id),
        }))
        await db.deleteHabit(id)
      },

      async toggleCompletion(habitId, date) {
        const exists = state.completions.some((c) => c.habitId === habitId && c.date === date)
        if (exists) {
          await db.removeCompletion(habitId, date)
        } else {
          await db.putCompletion({ habitId, date })
        }
        setState((s) => ({
          ...s,
          completions: exists
            ? s.completions.filter((c) => !(c.habitId === habitId && c.date === date))
            : [...s.completions, { habitId, date }],
        }))
      },

      async setMood(date, value, note) {
        const entry: MoodEntry = { date, value, note }
        await db.putMood(entry)
        setState((s) => ({
          ...s,
          moods: [...s.moods.filter((m) => m.date !== date), entry],
        }))
      },

      async clearAllData() {
        setState((s) => ({ ...s, habits: [], completions: [], moods: [] }))
        await db.clearAllData()
      },

      isDone: (habitId, date) =>
        state.completions.some((c) => c.habitId === habitId && c.date === date),

      habitStreaks: (habitId) =>
        computeStreaks(
          state.completions.filter((c) => c.habitId === habitId).map((c) => c.date),
        ),
    }),
    [state],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useApp muss innerhalb von <AppProvider> verwendet werden')
  }
  return ctx
}
