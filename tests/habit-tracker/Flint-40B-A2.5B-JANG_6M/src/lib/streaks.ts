import { addDays, dayDiff, todayKey } from './date'

export interface StreakInfo {
  /** Consecutive days ending today (or yesterday, if today is still open). */
  current: number
  /** Longest run of consecutive days ever recorded. */
  longest: number
  /** Total number of completed days. */
  total: number
}

/**
 * Compute streaks from a set of completed day keys.
 *
 * A streak stays "current" until a full day is missed: if today is not yet
 * checked, the run ending yesterday still counts.
 */
export function computeStreaks(
  dates: Iterable<string>,
  today: string = todayKey(),
): StreakInfo {
  const sorted = [...new Set(dates)].sort()
  const total = sorted.length

  if (total === 0) return { current: 0, longest: 0, total: 0 }

  const set = new Set(sorted)

  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i += 1) {
    if (dayDiff(sorted[i - 1], sorted[i]) === 1) {
      run += 1
    } else {
      run = 1
    }
    if (run > longest) longest = run
  }

  let current = 0
  let cursor = today
  if (!set.has(cursor)) {
    cursor = addDays(today, -1)
  }
  while (set.has(cursor)) {
    current += 1
    cursor = addDays(cursor, -1)
  }

  return { current, longest, total }
}