import { addDays, formatDate } from './date'

export interface Streaks {
  current: number
  longest: number
}

/**
 * Berechnet aktuelle und längste Serie aus einer Menge abgeschlossener Tage.
 *
 * Aktuelle Serie: läuft von heute rückwärts, solange keine Lücke ist.
 * Wenn heute nicht erledigt, startet die Serie am Vortag.
 */
export function computeStreaks(completedDays: string[]): Streaks {
  if (completedDays.length === 0) return { current: 0, longest: 0 }

  const set = new Set(completedDays)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = formatDate(today)

  // Startpunkt: heute, falls erledigt; sonst der Vortag.
  let anchor = set.has(todayKey) ? todayKey : addDays(todayKey, -1)

  let current = 0
  if (set.has(anchor)) {
    let cur = anchor
    while (set.has(cur)) {
      current++
      cur = addDays(cur, -1)
    }
  }

  const longest = computeLongest(completedDays, set)
  return { current, longest }
}

/** Längste zusammenhängende Serie über die gesamte Historie. */
function computeLongest(days: string[], set: Set<string>): number {
  let longest = 0
  for (const day of days) {
    // Nur Runs starten, die wirklich am Anfang liegen (kein Vorgänger).
    if (!set.has(addDays(day, -1))) {
      let len = 0
      let cur = day
      while (set.has(cur)) {
        len++
        cur = addDays(cur, 1)
      }
      if (len > longest) longest = len
    }
  }
  return longest
}
