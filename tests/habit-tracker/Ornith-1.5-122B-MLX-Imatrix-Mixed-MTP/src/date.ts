/** Alle Tage werden lokal (ohne UTC-Verschiebung) behandelt. */

export function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Heutiges Datum als YYYY-MM-DD. */
export function todayKey(d: Date = new Date()): string {
  return formatDate(d)
}

/** Parse eines YYYY-MM-DD-Keys zu einem lokalen Datum. */
export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Addiert `n` Tage zu einem Day-Key und gibt den neuen Key zurück. */
export function addDays(key: string, n: number): string {
  const d = parseKey(key)
  d.setDate(d.getDate() + n)
  return formatDate(d)
}

/** Wochentag-Index 0..6 (Sonntag = 0), lokal. */
export function weekdayIndex(d: Date): number {
  return d.getDay()
}

const WEEKDAYS_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

/** Kurzer Wochentagname auf Deutsch. */
export function weekdayShort(d: Date): string {
  return WEEKDAYS_DE[d.getDay()]
}

/** Vollständiges Datumsformat auf Deutsch, z. B. „Sonntag, 25. Oktober 2026". */
export function formatLongDate(d: Date): string {
  return d.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Letzte `n` Tage bis einschließlich heute (Index 0 = heute). */
export function lastNDays(n: number): Date[] {
  const out: Date[] = []
  const base = new Date()
  base.setHours(0, 0, 0, 0)
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base)
    d.setDate(d.getDate() - i)
    out.push(d)
  }
  return out
}
