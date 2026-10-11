import { addDays, todayKey } from './dates'

export interface Streaks {
  /** Aktive Serie: aufeinanderfolgende Tage, endend heute (oder gestern, falls heute noch offen). */
  current: number
  /** Längste je erreichte Serie. */
  longest: number
}

/**
 * Rechnet beide Serien aus einer Menge abgeschlossener Tage (YYYY-MM-DD) heraus.
 * Heute zählt nur, wenn bereits abgeschlossen; liegt heute noch offen, beginnt
 * die Zählung der aktiven Serie bei gestern – eine Serie „stirbt" nicht
 * automatisch am Morgen.
 */
export function computeStreaks(completedDates: Iterable<string>): Streaks {
  const set = new Set(completedDates)
  const today = todayKey()

  let current = 0
  let cursor = set.has(today) ? today : addDays(today, -1)
  while (set.has(cursor)) {
    current += 1
    cursor = addDays(cursor, -1)
  }

  let longest = 0
  let run = 0
  let previous: string | null = null
  for (const date of [...set].sort()) {
    run = previous !== null && addDays(previous, 1) === date ? run + 1 : 1
    if (run > longest) longest = run
    previous = date
  }

  return { current: Math.max(current, 0), longest: Math.max(longest, current) }
}
