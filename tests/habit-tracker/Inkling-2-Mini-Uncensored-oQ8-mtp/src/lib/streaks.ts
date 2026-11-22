/** Streak calculation on a set of 'YYYY-MM-DD' completion dates. */

import { addDays, todayStr } from './dates'

/**
 * Current streak for one habit:
 * - if today is completed, count backwards from today
 * - else if yesterday is completed, count backwards from yesterday
 * - otherwise 0
 */
export function currentStreak(dates: Set<string>, today: string = todayStr()): number {
  let cursor: string
  if (dates.has(today)) {
    cursor = today
  } else {
    const yesterday = addDays(today, -1)
    if (dates.has(yesterday)) {
      cursor = yesterday
    } else {
      return 0
    }
  }
  let count = 0
  while (dates.has(cursor)) {
    count++
    cursor = addDays(cursor, -1)
  }
  return count
}

/** Longest run of consecutive completed days in the whole history. */
export function longestStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0
  const sorted = [...dates].sort()
  let best = 1
  let run = 1
  let prev = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]
    if (addDays(prev, 1) === cur) {
      run++
      if (run > best) best = run
    } else if (prev !== cur) {
      run = 1
    }
    prev = cur
  }
  return best
}
