import { useState, useEffect, useCallback } from 'react'
import type { Habit, MoodEntry } from './types'
import {
  getHabits, addHabit, updateHabit, deleteHabit,
  getCompletions, toggleCompletion,
  getMoods, getMoodForDate, saveMood,
  calcStreak, getTodayStr,
} from './db'

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<{ habitId: string; date: string }[]>([])
  const [streaks, setStreaks] = useState<Record<string, { current: number; best: number }>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [h, c] = await Promise.all([getHabits(), getCompletions()])
    setHabits(h)
    setCompletions(c)
    setStreaks(calcStreak(h, c))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (data: Omit<Habit, 'id' | 'createdAt'>) => {
    const h = await addHabit(data)
    setHabits((prev) => [...prev, h])
  }, [])

  const update = useCallback(async (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
    await updateHabit(id, updates)
    const h = await getHabits()
    const c = await getCompletions()
    setHabits(h)
    setCompletions(c)
    setStreaks(calcStreak(h, c))
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteHabit(id)
    const h = await getHabits()
    const c = await getCompletions()
    setHabits(h)
    setCompletions(c)
    setStreaks(calcStreak(h, c))
  }, [])

  const toggle = useCallback(async (habitId: string, date: string) => {
    await toggleCompletion(habitId, date)
    const h = await getHabits()
    const c = await getCompletions()
    setHabits(h)
    setCompletions(c)
    setStreaks(calcStreak(h, c))
  }, [])

  return { habits, completions, streaks, loading, add, update, remove, toggle }
}

export function useMood() {
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const all = await getMoods()
    setMoods(all)
    const today = getTodayStr()
    const m = await getMoodForDate(today)
    setTodayMood(m)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (entry: Omit<MoodEntry, 'date'> & { date: string }) => {
    await saveMood(entry)
    const all = await getMoods()
    setMoods(all)
    if (entry.date === getTodayStr()) {
      setTodayMood(entry)
    }
  }, [])

  return { moods, todayMood, loading, save }
}

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('rhythm-dark')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('rhythm-dark', String(dark))
  }, [dark])

  const toggle = useCallback(() => setDark((d) => !d), [])

  return { dark, toggle }
}
