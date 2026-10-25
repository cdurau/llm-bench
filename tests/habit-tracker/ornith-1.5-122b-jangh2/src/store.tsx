import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  Habit,
  Completion,
  Mood,
  Settings,
  StoreState,
  ThemeMode,
  EffectiveTheme,
  Streaks,
} from './types'
import {
  loadHabits,
  loadCompletions,
  loadMoodsSince,
  loadSettings,
  saveHabit,
  saveMood,
  saveSettings,
  toggleCompletion,
  deleteHabit as deleteHabitDB,
} from './db'
import { todayLocal } from './lib/dates'
import { computeStreaks } from './lib/streaks'

const StoreContext = createContext<StoreState | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const today = useMemo(() => todayLocal(), [])
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [moods, setMoods] = useState<Record<string, Mood>>({})
  const [settings, setSettings] = useState<Settings>({ theme: 'system' })
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light')
  const [ready, setReady] = useState(false)

  // --- Theme: folgt dem System oder manueller Override ---
  useEffect(() => {
    const apply = () => {
      const eff: EffectiveTheme =
        settings.theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : settings.theme
      setEffectiveTheme(eff)
      document.documentElement.setAttribute('data-theme', eff)
    }
    apply()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      if (settings.theme === 'system') apply()
    }
    mq.addEventListener?.('change', listener)
    return () => mq.removeEventListener?.('change', listener)
  }, [settings.theme])

  // --- Initial load aus IndexedDB ---
  useEffect(() => {
    let mounted = true
    void (async () => {
      const [h, c, s, m] = await Promise.all([
        loadHabits(),
        loadCompletions(),
        loadSettings(),
        loadMoodsSince(today),
      ])
      if (!mounted) return
      const moodMap: Record<string, Mood> = {}
      for (const mm of m) moodMap[mm.date] = mm
      setHabits(h.sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
      setCompletions(c)
      setMoods(moodMap)
      setSettings(s ?? { theme: 'system' })
      setReady(true)
    })()
    return () => {
      mounted = false
    }
  }, [today])

  // --- Derived helpers ---
  const isDone = useCallback(
    (habitId: string, date: string): boolean =>
      completions.some((c) => c.habitId === habitId && c.date === date),
    [completions],
  )
  const completedDates = useCallback(
    (habitId: string): string[] =>
      completions.filter((c) => c.habitId === habitId).map((c) => c.date),
    [completions],
  )
  const streaks = useCallback(
    (habitId: string): Streaks => computeStreaks(completedDates(habitId), today),
    [completedDates, today],
  )

  // --- Actions ---
  const addHabit = useCallback(
    async (h: Omit<Habit, 'id' | 'createdAt'>) => {
      const habit: Habit = { id: crypto.randomUUID(), createdAt: today, ...h }
      await saveHabit(habit)
      setHabits((prev) => [...prev, habit].sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
    },
    [today],
  )
  const updateHabit = useCallback(async (h: Habit) => {
    await saveHabit(h)
    setHabits((prev) => prev.map((x) => (x.id === h.id ? h : x)))
  }, [])
  const deleteHabit = useCallback(async (id: string) => {
    await deleteHabitDB(id)
    setHabits((prev) => prev.filter((x) => x.id !== id))
    setCompletions((prev) => prev.filter((c) => c.habitId !== id))
  }, [])
  const toggle = useCallback(async (habitId: string, date: string) => {
    await toggleCompletion(habitId, date)
    setCompletions((prev) => {
      const existing = prev.find((c) => c.habitId === habitId && c.date === date)
      if (existing) return prev.filter((c) => c.id !== existing.id)
      return [...prev, { id: `${habitId}_${date}`, habitId, date }]
    })
  }, [])
  const setMood = useCallback(async (date: string, value: number, note: string) => {
    const m: Mood = { date, value, note }
    await saveMood(m)
    setMoods((prev) => ({ ...prev, [date]: m }))
  }, [])
  const setTheme = useCallback(async (theme: ThemeMode) => {
    const s: Settings = { theme }
    await saveSettings(s)
    setSettings(s)
  }, [])

  const value = useMemo<StoreState>(
    () => ({
      habits,
      completions,
      moods,
      settings,
      today,
      effectiveTheme,
      ready,
      isDone,
      completedDates,
      streaks,
      addHabit,
      updateHabit,
      deleteHabit,
      toggle,
      setMood,
      setTheme,
    }),
    [
      habits,
      completions,
      moods,
      settings,
      today,
      effectiveTheme,
      ready,
      isDone,
      completedDates,
      streaks,
      addHabit,
      updateHabit,
      deleteHabit,
      toggle,
      setMood,
      setTheme,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore muss innerhalb von StoreProvider verwendet werden')
  return ctx
}