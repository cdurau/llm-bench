import { addDays, addDaysKey, keyOf, toDate, todayKey } from "./date"

export interface Streaks {
  current: number
  longest: number
}

export function computeStreaks(dates: string[]): Streaks {
  const sorted = Array.from(new Set(dates)).sort()
  const set = new Set(sorted)

  // Longest streak: longest run of consecutive calendar days. Uses calendar
  // arithmetic (not raw timestamps) so DST transitions never split a run.
  let longest = sorted.length === 0 ? 0 : 1
  let run = sorted.length === 0 ? 0 : 1
  for (let i = 1; i < sorted.length; i++) {
    const expected = keyOf(addDays(toDate(sorted[i - 1]), 1))
    run = sorted[i] === expected ? run + 1 : 1
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
