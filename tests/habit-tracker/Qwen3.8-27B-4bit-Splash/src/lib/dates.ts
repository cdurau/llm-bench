// Lokale Datums-Helfer. Bewusst lokal statt UTC, damit „heute“ für
// den Nutzer bedeutet, was sein Kalender bedeutet (auch über Zeitzonenwechsel).

export const WEEKDAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'] as const

export const WEEKDAYS = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
] as const

export const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const

/** Kalendertag als „JJJJ-MM-TT“ (lokal). */
export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** „JJJJ-MM-TT“ als lokaler Kalender-Mitternachtspunkt. */
export function parseDayKey(key: string): Date {
  return new Date(`${key}T00:00:00`)
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

export function todayKey(): string {
  return dayKey(new Date())
}

/** z. B. „Mittwoch, 16. Oktober“ */
export function formatLong(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()}. ${MONTHS[date.getMonth()]}`
}

/** Kürze Wochentags-Kennung für Chart-Achsen: „Mi 16“ */
export function formatShortDay(date: Date): string {
  return `${WEEKDAYS_SHORT[date.getDay()]} ${date.getDate()}`
}

/** z. B. „10. – 16. Oktober“ bzw. „28. September – 4. Oktober“ */
export function formatRange(from: Date, to: Date): string {
  const fromMonth = MONTHS[from.getMonth()]
  const toMonth = MONTHS[to.getMonth()]
  if (fromMonth === toMonth) {
    return `${from.getDate()}. – ${to.getDate()}. ${fromMonth}`
  }
  return `${from.getDate()}. ${fromMonth} – ${to.getDate()}. ${toMonth}`
}

/** Die letzten n Tage, aufsteigend, endet bei „end“. */
export function lastNDays(n: number, end: Date = new Date()): Date[] {
  const out: Date[] = []
  for (let i = n - 1; i >= 0; i--) {
    out.push(addDays(end, -i))
  }
  return out
}
