import { db } from './db'

interface HabitCompletion {
  habitId: string
  date: string
}

export async function calculateStreaks(habits: any[]): Promise<Map<string, { current: number; longest: number }>> {
  const streaks = new Map<string, { current: number; longest: number }>()

  for (const habit of habits) {
    const completions = await db.completions
      .where('habitId')
      .equals(habit.id)
      .sortBy('date')

    if (completions.length === 0) {
      streaks.set(habit.id, { current: 0, longest: 0 })
      continue
    }

    const sortedDates = completions.map(c => c.date).sort()
    const dates = new Set(sortedDates)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate longest streak
    let longest = 0
    let current = 0

    // Check from most recent backwards
    const checkDate = new Date(sortedDates[sortedDates.length - 1])
    const checkStart = new Date(today)
    checkStart.setDate(checkStart.getDate() - 90) // Look back up to 90 days

    for (let i = 0; i < 90; i++) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (dates.has(dateStr)) {
        current++
        longest = Math.max(longest, current)
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (i > 0) {
        current = 0
      } else {
        // If today is not in the set, check if it's in the future
        const todayStr = today.toISOString().split('T')[0]
        if (dateStr === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1)
          continue
        }
      }
    }

    streaks.set(habit.id, { current: longest, longest })
  }

  return streaks
}

export async function getTodayHabits(): Promise<HabitCompletion[]> {
  const today = new Date().toISOString().split('T')[0]
  return await db.completions.where('date').equals(today).toArray()
}

export async function getHabitCompletionsInRange(habitId: string, startDate: string, endDate: string): Promise<HabitCompletion[]> {
  return await db.completions
    .where('habitId')
    .equals(habitId)
    .and(c => c.date >= startDate && c.date <= endDate)
    .toArray()
}
