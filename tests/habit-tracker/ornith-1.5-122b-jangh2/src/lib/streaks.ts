// Streak-Logik: aktuelle und längste Serie pro Habit.
import { dayBefore, dayIndex, isNextDay } from './dates'

export interface Streaks {
  current: number
  longest: number
}

/**
 * Aktuelle Serie: aufeinanderfolgende Tage, rückwärts ab `today`,
 * in denen der Habit erledigt war. Ist heute erledigt, ist current >= 1.
 */
export function currentStreak(completionDates: string[], today: string): number {
  const set = new Set(completionDates)
  let count = 0
  let d = today
  while (set.has(d)) {
    count += 1
    d = dayBefore(d)
  }
  return count
}

/** Längste aufeinanderfolgende Serie in der gesamten Historie. */
export function longestStreak(completionDates: string[]): number {
  const sorted = [...new Set(completionDates)].sort()
  let longest = 0
  let run = 0
  let prev: string | null = null
  for (const d of sorted) {
    if (prev && isNextDay(d, prev)) {
      run += 1
    } else {
      run = 1
    }
    if (run > longest) longest = run
    prev = d
  }
  return longest
}

export function computeStreaks(completionDates: string[], today: string): Streaks {
  return {
    current: currentStreak(completionDates, today),
    longest: longestStreak(completionDates),
  }
}