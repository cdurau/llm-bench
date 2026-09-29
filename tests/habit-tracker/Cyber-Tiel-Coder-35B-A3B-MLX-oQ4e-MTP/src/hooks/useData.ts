import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  deleteHabit,
  loadSnapshot,
  putHabit,
  putMood,
  setCompletion,
  type Snapshot,
} from '../db'
import { todayKey } from '../lib/date'
import type { Habit, MoodEntry } from '../types'

const EMPTY: Snapshot = { habits: [], completions: [], moods: [] }

/**
 * Central data layer. Loads the snapshot once, keeps it in memory, and writes
 * every change back to IndexedDB. The app is fully offline after first load.
 */
export function useData() {
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadSnapshot().then((s) => {
      setSnapshot(s)
      setReady(true)
    })
  }, [])

  const habits = snapshot.habits
  const completions = snapshot.completions
  const moods = snapshot.moods
  const completionsByHabit = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const c of snapshot.completions) {
      const set = map.get(c.habitId) ?? new Set<string>()
      set.add(c.date)
      map.set(c.habitId, set)
    }
    return map
  }, [snapshot.completions])

  const moodByKey = useMemo(() => {
    const map = new Map<string, MoodEntry>()
    for (const m of snapshot.moods) map.set(m.date, m)
    return map
  }, [snapshot.moods])

  const isDone = useCallback(
    (habitId: string, date: string): boolean =>
      completionsByHabit.get(habitId)?.has(date) ?? false,
    [completionsByHabit],
  )

  const toggleCompletion = useCallback(
    (habitId: string, date: string) => {
      const done = isDone(habitId, date)
      const nextCompletions = snapshot.completions.filter(
        (c) => !(c.habitId === habitId && c.date === date),
      )
      if (!done) {
        nextCompletions.push({ habitId, date })
      }
      setSnapshot((s) => ({ ...s, completions: nextCompletions }))
      setCompletion(habitId, date, !done)
    },
    [isDone, snapshot.completions],
  )

  const addHabit = useCallback(
    (input: { name: string; emoji: string; color: string }) => {
      const habit: Habit = {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        emoji: input.emoji || '🌱',
        color: input.color,
        createdAt: todayKey(),
        order: snapshot.habits.length,
      }
      setSnapshot((s) => ({ ...s, habits: [...s.habits, habit] }))
      putHabit(habit)
    },
    [snapshot.habits.length],
  )

  const renameHabit = useCallback(
    (id: string, name: string) => {
      const habit = snapshot.habits.find((h) => h.id === id)
      if (!habit) return
      const updated = { ...habit, name: name.trim() }
      setSnapshot((s) => ({
        ...s,
        habits: s.habits.map((h) => (h.id === id ? updated : h)),
      }))
      putHabit(updated)
    },
    [snapshot.habits],
  )

  const setHabitColor = useCallback(
    (id: string, color: string) => {
      const habit = snapshot.habits.find((h) => h.id === id)
      if (!habit) return
      const updated = { ...habit, color }
      setSnapshot((s) => ({
        ...s,
        habits: s.habits.map((h) => (h.id === id ? updated : h)),
      }))
      putHabit(updated)
    },
    [snapshot.habits],
  )

  const removeHabit = useCallback(
    (id: string) => {
      setSnapshot((s) => ({
        ...s,
        habits: s.habits.filter((h) => h.id !== id),
        completions: s.completions.filter((c) => c.habitId !== id),
      }))
      deleteHabit(id)
    },
    [],
  )

  const setMood = useCallback(
    (date: string, mood: number, note?: string) => {
      const entry: MoodEntry = { date, mood, ...(note ? { note } : {}) }
      setSnapshot((s) => {
        const others = s.moods.filter((m) => m.date !== date)
        return { ...s, moods: [...others, entry] }
      })
      putMood(entry)
    },
    [],
  )

  return {
    ready,
    habits,
    completions,
    moods,
    moodByKey,
    isDone,
    toggleCompletion,
    addHabit,
    renameHabit,
    setHabitColor,
    removeHabit,
    setMood,
  }
}

export type DataLayer = ReturnType<typeof useData>
