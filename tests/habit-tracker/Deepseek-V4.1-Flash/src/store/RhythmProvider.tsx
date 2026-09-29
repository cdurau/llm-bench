import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  deleteHabit as dbDeleteHabit,
  deleteMood as dbDeleteMood,
  loadSnapshot,
  putHabit,
  putMood,
  setCompletion,
} from '../db'
import { todayKey } from '../lib/date'
import type { Habit, MoodEntry } from '../types'
import {
  RhythmContext,
  type NewHabit,
  type RhythmContextValue,
} from './context'

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `habit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function RhythmProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Set<string>>(new Set())
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    loadSnapshot()
      .then((snapshot) => {
        if (!active) return
        setHabits(snapshot.habits)
        setCompletions(
          new Set(snapshot.completions.map((c) => `${c.habitId}|${c.date}`)),
        )
        setMoods(snapshot.moods)
      })
      .catch((error) => {
        console.error('Daten konnten nicht geladen werden', error)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const isDone = useCallback(
    (habitId: string, date: string) => completions.has(`${habitId}|${date}`),
    [completions],
  )

  const datesFor = useCallback(
    (habitId: string) => {
      const out: string[] = []
      const prefix = `${habitId}|`
      for (const key of completions) {
        if (key.startsWith(prefix)) out.push(key.slice(prefix.length))
      }
      return out
    },
    [completions],
  )

  const moodFor = useCallback(
    (date: string) => moods.find((m) => m.date === date),
    [moods],
  )

  const addHabit = useCallback(
    async (input: NewHabit) => {
      const habit: Habit = {
        id: makeId(),
        name: input.name.trim(),
        emoji: input.emoji,
        color: input.color,
        createdAt: todayKey(),
        order: habits.reduce((max, h) => Math.max(max, h.order), -1) + 1,
      }
      setHabits((prev) => [...prev, habit])
      try {
        await putHabit(habit)
      } catch (error) {
        console.error('Gewohnheit konnte nicht gespeichert werden', error)
      }
      return habit
    },
    [habits],
  )

  const updateHabit = useCallback(
    async (id: string, patch: Partial<NewHabit>) => {
      const existing = habits.find((habit) => habit.id === id)
      if (!existing) return
      const updated: Habit = { ...existing, ...patch }
      setHabits((prev) =>
        prev.map((habit) => (habit.id === id ? updated : habit)),
      )
      try {
        await putHabit(updated)
      } catch (error) {
        console.error('Änderung konnte nicht gespeichert werden', error)
      }
    },
    [habits],
  )

  const removeHabit = useCallback(async (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id))
    setCompletions((prev) => {
      const next = new Set<string>()
      const prefix = `${id}|`
      for (const key of prev) {
        if (!key.startsWith(prefix)) next.add(key)
      }
      return next
    })
    try {
      await dbDeleteHabit(id)
    } catch (error) {
      console.error('Gewohnheit konnte nicht gelöscht werden', error)
    }
  }, [])

  const toggle = useCallback(
    async (habitId: string, date: string) => {
      const key = `${habitId}|${date}`
      const willBeDone = !completions.has(key)
      setCompletions((prev) => {
        const next = new Set(prev)
        if (willBeDone) next.add(key)
        else next.delete(key)
        return next
      })
      try {
        await setCompletion(habitId, date, willBeDone)
      } catch (error) {
        console.error('Eintrag konnte nicht gespeichert werden', error)
      }
    },
    [completions],
  )

  const saveMood = useCallback(
    async (date: string, mood: number, note?: string) => {
      const entry: MoodEntry = {
        date,
        mood,
        ...(note && note.trim() ? { note: note.trim() } : {}),
      }
      setMoods((prev) => {
        const others = prev.filter((m) => m.date !== date)
        return [...others, entry]
      })
      try {
        await putMood(entry)
      } catch (error) {
        console.error('Stimmung konnte nicht gespeichert werden', error)
      }
    },
    [],
  )

  const clearMood = useCallback(async (date: string) => {
    setMoods((prev) => prev.filter((m) => m.date !== date))
    try {
      await dbDeleteMood(date)
    } catch (error) {
      console.error('Stimmung konnte nicht entfernt werden', error)
    }
  }, [])

  const value = useMemo<RhythmContextValue>(
    () => ({
      habits,
      moods,
      loading,
      isDone,
      datesFor,
      moodFor,
      addHabit,
      updateHabit,
      removeHabit,
      toggle,
      saveMood,
      clearMood,
    }),
    [
      habits,
      moods,
      loading,
      isDone,
      datesFor,
      moodFor,
      addHabit,
      updateHabit,
      removeHabit,
      toggle,
      saveMood,
      clearMood,
    ],
  )

  return (
    <RhythmContext.Provider value={value}>{children}</RhythmContext.Provider>
  )
}
