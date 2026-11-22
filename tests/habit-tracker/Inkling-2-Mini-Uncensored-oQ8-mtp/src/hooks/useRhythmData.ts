import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getAllHabits,
  getAllCompletions,
  getMoods
} from '../db'
import type { Habit, Completion, MoodEntry } from '../types'
import { currentStreak, longestStreak } from '../lib/streaks'
import { todayStr } from '../lib/dates'

export interface RhythmData {
  loading: boolean
  habits: Habit[]
  completions: Completion[]
  moods: Map<string, MoodEntry>
  reload: () => Promise<void>
}

export function useRhythmData(): RhythmData {
  const [loading, setLoading] = useState(true)
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [moods, setMoods] = useState<Map<string, MoodEntry>>(new Map())

  const reload = useCallback(async () => {
    const [h, c, m] = await Promise.all([getAllHabits(), getAllCompletions(), getMoods()])
    setHabits(h)
    setCompletions(c)
    setMoods(new Map(m.map((entry) => [entry.date, entry])))
    setLoading(false)
  }, [])

  useEffect(() => {
    reload().catch((err) => {
      console.error('Failed to load rhythm data', err)
      setLoading(false)
    })
  }, [reload])

  return { loading, habits, completions, moods, reload }
}

/** Derived per-habit streaks + today's completion state. */
export function useHabitStats(habits: Habit[], completions: Completion[], today: string = todayStr()) {
  return useMemo(() => {
    const byHabit = new Map<string, Set<string>>()
    for (const c of completions) {
      const set = byHabit.get(c.habitId) ?? new Set<string>()
      set.add(c.date)
      byHabit.set(c.habitId, set)
    }
    return new Map(
      habits.map((h) => {
        const dates = byHabit.get(h.id) ?? new Set<string>()
        return [
          h.id,
          {
            dates,
            doneToday: dates.has(today),
            current: currentStreak(dates, today),
            longest: longestStreak(dates)
          }
        ] as const
      })
    )
  }, [habits, completions, today])
}
