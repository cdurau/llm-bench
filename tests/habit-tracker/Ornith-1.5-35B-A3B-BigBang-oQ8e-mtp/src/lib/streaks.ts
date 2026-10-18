import { addDaysKey, toDate, todayKey } from "./date"

export interface Streaks {
  current: number
  longest: number
}

export function computeStreaks(dates: string[]): Streaks {
  const sorted = Array.from(new Set(dates)).sort()
  const set = new Set(sorted)

  // Longest streak: longest run of consecutive days.
  let longest = 0
  let run = 0
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      run = 1
    } else {
      const diff = (toDate(sorted[i]).getTime() - toDate(sorted[i - 1]).getTime()) / 86400000
      run = diff === 1 ? run + 1 : 1
    }
    longest = Math.max(longest, run)
  }

  // Current streak: consecutive run ending today, or yesterday (if today untouched).
  let current = 0
  const today = todayKey()
  const check = set.has(today) ? today : set.has(addDaysKey(today, -1)) ? addDaysKey(today, -1) : null
  if (check) {
    let cursor = check
    while (set.has(cursor)) {
      current += 1
      cursor = addDaysKey(cursor, -1)
    }
  }

  return { current, longest }
}
