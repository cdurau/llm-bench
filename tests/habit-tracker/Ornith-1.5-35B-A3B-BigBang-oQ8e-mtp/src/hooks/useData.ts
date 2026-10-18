import { useCallback, useEffect, useState } from "react"
import * as db from "../lib/db"
import { todayKey } from "../lib/date"
import type { Habit, MoodEntry } from "../types"

interface State {
  habits: Habit[]
  completions: Array<{ habitId: string; date: string }>
  moods: MoodEntry[]
  ready: boolean
}

function emptyState(): State {
  return { habits: [], completions: [], moods: [], ready: false }
}

export function useData() {
  const [state, setState] = useState<State>(emptyState())

  const load = useCallback(async () => {
    try {
      const [habits, completions, moods] = await Promise.all([
        db.getHabits(),
        db.getCompletions(),
        db.getMoods(),
      ])
      setState({ habits, completions, moods, ready: true })
    } catch (error) {
      console.error("Rhythm: data load failed", error)
      setState((s) => ({ ...s, ready: true }))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    function reload() {
      load()
    }
    window.addEventListener("focus", reload)
    document.addEventListener("visibilitychange", reload)
    return () => {
      window.removeEventListener("focus", reload)
      document.removeEventListener("visibilitychange", reload)
    }
  }, [load])

  const toggleHabit = useCallback(
    async (habitId: string, date = todayKey()) => {
      const was = state.completions.some(
        (c) => c.habitId === habitId && c.date === date
      )
      if (was) await db.uncompleteHabit(habitId, date)
      else await db.completeHabit(habitId, date)
      await load()
    },
    [state.completions, load]
  )

  const addHabit = useCallback(
    async (partial: {
      name: string
      emoji: string
      color: string
      id?: string
      createdAt?: number
    }) => {
      const habit: Habit = {
        ...partial,
        id: partial.id ?? crypto.randomUUID(),
        createdAt: partial.createdAt ?? Date.now(),
      }
      await db.upsertHabit(habit)
      await load()
    },
    [load]
  )

  const renameHabit = useCallback(
    async (id: string, name: string) => {
      const habit = state.habits.find((h) => h.id === id)
      if (!habit) return
      await db.upsertHabit({ ...habit, name })
      await load()
    },
    [state.habits, load]
  )

  const updateHabitStyle = useCallback(
    async (id: string, patch: Partial<Pick<Habit, "emoji" | "color">>) => {
      const habit = state.habits.find((h) => h.id === id)
      if (!habit) return
      await db.upsertHabit({ ...habit, ...patch })
      await load()
    },
    [state.habits, load]
  )

  const deleteHabit = useCallback(
    async (id: string) => {
      await db.deleteHabit(id)
      await load()
    },
    [load]
  )

  const saveMood = useCallback(
    async (value: number, note: string, date = todayKey()) => {
      await db.saveMood({ date, value, note })
      await load()
    },
    [load]
  )

  const clearAll = useCallback(async () => {
    await db.clearAll()
    await load()
  }, [load])

  const completedToday = state.completions
    .filter((c) => c.date === todayKey())
    .map((c) => c.habitId)

  return {
    state,
    ready: state.ready,
    habits: state.habits,
    completions: state.completions,
    moods: state.moods,
    completedToday,
    toggleHabit,
    addHabit,
    renameHabit,
    updateHabitStyle,
    deleteHabit,
    saveMood,
    clearAll,
    reload: load,
  }
}
