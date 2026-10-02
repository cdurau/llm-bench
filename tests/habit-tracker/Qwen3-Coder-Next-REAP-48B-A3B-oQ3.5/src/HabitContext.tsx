import { createContext, useState, useEffect, useMemo } from 'react'
import type { Habit } from './types'
import * as db from './db'

export interface HabitsContextValue {
  habits: Habit[]
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>
}

export const HabitContext = createContext<HabitsContextValue | undefined>(undefined)

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.getHabits().then((habits) => {
      setHabits(habits)
      setLoading(false)
    })
  }, [])

  const HabitsContextValue = useMemo(
    (): HabitsContextValue => ({
      habits,
      setHabits,
    }),
    [habits]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    )
  }

  return <HabitContext.Provider value={HabitsContextValue}>{children}</HabitContext.Provider>
}
