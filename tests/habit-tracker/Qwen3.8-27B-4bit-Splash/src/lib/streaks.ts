import { addDays, dayKey, parseDayKey } from './dates'

export interface Streaks {
  /** consecutive Tage bis heute (heute nicht erledigt => von gestern zurück) */
  current: number
  /** längste zusammenhängende Serie über die gesamte Geschichte */
  longest: number
}

/**
 * Rechnet Streaks aus einer Menge von Tag-Schlüsseln („JJJJ-MM-TT“).
 * Operiert auf Kalenderdaten, damit Zeitzone/UTC keine Lücken erzeugen.
 */
export function computeStreaks(dateKeys: Iterable<string>, today: Date = new Date()): Streaks {
  const set = new Set(dateKeys)
  if (set.size === 0) {
    return { current: 0, longest: 0 }
  }

  // Aktuelle Serie: heute zählt mit, sonst startet sie bei gestern.
  let cursor = new Date(today)
  if (!set.has(dayKey(cursor))) {
    cursor = addDays(cursor, -1)
  }
  let current = 0
  while (set.has(dayKey(cursor))) {
    current += 1
    cursor = addDays(cursor, -1)
  }

  // Längste Serie: ISO-Schlüssel sortieren chronologisch (Kalenderdaten).
  const sorted = [...set].sort()
  let longest = 0
  let run = 0
  let previous: Date | null = null
  for (const key of sorted) {
    const day = parseDayKey(key)
    if (previous !== null && dayKey(addDays(previous, 1)) === key) {
      run += 1
    } else {
      run = 1
    }
    longest = Math.max(longest, run)
    previous = day
  }

  return { current, longest }
}
