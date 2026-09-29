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
export function computeStreaks(completedDays: string[]): StreakInfo {
  const sorted = [...new Set(completedDays)].sort()
  const set = new Set(sorted)

  // Longest run.
  let longest = 0
  let run = 0
  let cursor: string | null = null
  for (const key of sorted) {
    if (cursor !== null && dayDiff(cursor, key) === 1) {
      run += 1
    } else {
      run = 1
    }
    cursor = key
    longest = Math.max(longest, run)
  }

  // Current run: walk back from today (or yesterday if today is open).
  const today = todayKey()
  const todayOpen = set.has(today)
  const anchor = todayOpen ? today : addDays(today, -1)
  if (!set.has(anchor)) {
    return { current: 0, longest, total: sorted.length }
  }
  let current = 0
  let probe = anchor
  while (set.has(probe)) {
    current += 1
    probe = addDays(probe, 1)
  }
  return { current, longest, total: sorted.length }
}
