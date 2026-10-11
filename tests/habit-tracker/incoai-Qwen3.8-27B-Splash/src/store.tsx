import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as db from './lib/db'
import { todayKey } from './lib/dates'

interface RhythmState {
  loaded: boolean
  habits: db.Habit[]
  completions: db.Completion[]
  moods: db.MoodEntry[]
}

export interface NewHabitInput {
  name: string
  emoji: string
  color: string
}

interface RhythmStore extends RhythmState {
  addHabit: (input: NewHabitInput) => Promise<void>
  updateHabit: (id: string, patch: Partial<Omit<db.Habit, 'id' | 'createdAt'>>) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  toggleCompletion: (habitId: string, date?: string) => Promise<void>
  setMood: (date: string, value: number, note: string) => Promise<void>
  clearAll: () => Promise<void>
}

const RhythmContext = createContext<RhythmStore | null>(null)

export function RhythmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RhythmState>({
    loaded: false,
    habits: [],
    completions: [],
    moods: [],
  })

  const reload = useCallback(async () => {
    try {
      const [habits, completions, moods] = await Promise.all([
        db.getAllHabits(),
        db.getAllCompletions(),
        db.getAllMoods(),
      ])
      setState({ loaded: true, habits, completions, moods })
    } catch (error) {
      console.error('Rhythm: Laden der Daten fehlgeschlagen', error)
      setState((s) => ({ ...s, loaded: true }))
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  // Änderungen in anderen Fenstern/Taben spiegeln (gleiche Ursprungsdaten).
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key.startsWith('rhythm')) void reload()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [reload])

  const addHabit = useCallback(
    async (input: NewHabitInput) => {
      const habit: db.Habit = {
        id: db.uid(),
        name: input.name.trim(),
        emoji: input.emoji,
        color: input.color,
        createdAt: new Date().toISOString(),
      }
      if (!habit.name) return
      setState((s) => ({ ...s, habits: [...s.habits, habit] }))
      try {
        await db.putHabit(habit)
      } catch (error) {
        console.error('Rhythm: Habit konnte nicht gespeichert werden', error)
        await reload()
      }
    },
    [reload],
  )

  const updateHabit = useCallback(
    async (id: string, patch: Partial<Omit<db.Habit, 'id' | 'createdAt'>>) => {
      setState((s) => ({
        ...s,
        habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
      }))
      try {
        const current = await db.getAllHabits()
        const habit = current.find((h) => h.id === id)
        if (habit) await db.putHabit({ ...habit, ...patch, name: patch.name ?? habit.name })
      } catch (error) {
        console.error('Rhythm: Änderung konnte nicht gespeichert werden', error)
        await reload()
      }
    },
    [reload],
  )

  const deleteHabit = useCallback(
    async (id: string) => {
      setState((s) => ({
        ...s,
        habits: s.habits.filter((h) => h.id !== id),
        completions: s.completions.filter((c) => c.habitId !== id),
      }))
      try {
        await db.deleteHabitWithCompletions(id)
      } catch (error) {
        console.error('Rhythm: Löschen fehlgeschlagen', error)
        await reload()
      }
    },
    [reload],
  )

  const toggleCompletion = useCallback(
    async (habitId: string, date = todayKey()) => {
      const id = db.completionId(habitId, date)
      const exists = state.completions.some((c) => c.id === id)
      setState((s) => ({
        ...s,
        completions: exists
          ? s.completions.filter((c) => c.id !== id)
          : [...s.completions, { id, habitId, date }],
      }))
      try {
        if (exists) await db.deleteCompletion(habitId, date)
        else await db.addCompletion(habitId, date)
      } catch (error) {
        console.error('Rhythm: Abhaken fehlgeschlagen', error)
        await reload()
      }
    },
    [state.completions, reload],
  )

  const setMood = useCallback(
    async (date: string, value: number, note: string) => {
      setState((s) => ({
        ...s,
        moods: [...s.moods.filter((m) => m.date !== date), { date, value, note }],
      }))
      try {
        await db.putMood({ date, value, note })
      } catch (error) {
        console.error('Rhythm: Stimmung konnte nicht gespeichert werden', error)
        await reload()
      }
    },
    [reload],
  )

  const clearAll = useCallback(async () => {
    setState({ loaded: true, habits: [], completions: [], moods: [] })
    try {
      await db.clearAllData()
    } catch (error) {
      console.error('Rhythm: Leeren der Daten fehlgeschlagen', error)
      await reload()
    }
  }, [reload])

  const value = useMemo<RhythmStore>(
    () => ({ ...state, addHabit, updateHabit, deleteHabit, toggleCompletion, setMood, clearAll }),
    [state, addHabit, updateHabit, deleteHabit, toggleCompletion, setMood, clearAll],
  )

  return <RhythmContext.Provider value={value}>{children}</RhythmContext.Provider>
}

export function useRhythm(): RhythmStore {
  const ctx = useContext(RhythmContext)
  if (!ctx) throw new Error('useRhythm muss innerhalb von <RhythmProvider> verwendet werden')
  return ctx
}
