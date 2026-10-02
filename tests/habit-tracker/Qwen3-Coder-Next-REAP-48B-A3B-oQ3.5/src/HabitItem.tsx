import { useState, useEffect } from 'react'
import type { Habit } from './types'
import * as db from './db'

interface HabitItemProps {
  habit: Habit
  onToggle: () => void
}

export function HabitItem({ habit, onToggle }: HabitItemProps) {
  const [checked, setChecked] = useState(false)
  const [streak, setStreak] = useState(habit.streak)
  const [maxStreak, setMaxStreak] = useState(habit.maxStreak)

  // Check if habit is completed for today
  useEffect(() => {
    const checkTodayStatus = async () => {
      const date = db.formatDate(new Date())
      const logs = await db.getHabitLogsByDate(date)
      const log = logs.find((l: any) => l.habitId === habit.id)
      if (log) {
        setChecked(log.completed)
      }
      setStreak(habit.streak)
      setMaxStreak(habit.maxStreak)
    }
    checkTodayStatus()
  }, [habit.id, habit.streak, habit.maxStreak])

  const handleToggle = async () => {
    setChecked(!checked)
    await db.logHabitCompleted(habit.id, !checked)
    // Refresh habits to get updated streak
    const updatedHabits = await db.getHabits()
    const currentHabit = updatedHabits.find((h) => h.id === habit.id)
    if (currentHabit) {
      setStreak(currentHabit.streak)
      setMaxStreak(currentHabit.maxStreak)
    }
  }

  return (
    <div
      data-testid="habit-item"
      className="bg-surface dark:bg-surface-dark rounded-2xl p-4 shadow-md active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start gap-3">
        <button
          data-testid="habit-toggle"
          onClick={handleToggle}
          aria-pressed={checked}
          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            checked ? 'border-accent bg-accent' : 'border-border dark:border-border-dark'
          }`}
        >
          {checked && <span className="text-white text-xs">✓</span>}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{habit.emoji}</span>
            <h3 className="font-semibold">{habit.name}</h3>
          </div>
          <p className="text-sm opacity-70" data-testid="habit-streak">
            Streak: {streak} | Best: {maxStreak}
          </p>
        </div>
      </div>
      {habit.color !== 'bg-indigo-500' && (
        <div className={`mt-2 h-2 rounded-full ${habit.color}`}></div>
      )}
    </div>
  )
}
