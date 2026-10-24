// Datums-Helfer (lokale Tage, deutsch).

/** Lokaler Tag als YYYY-MM-DD (ohne Zeitzone, rein kalenderbasiert). */
export function todayLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** YYYY-MM-DD -> vollständiges deutsches Datum, z. B. "Samstag, 24. Oktober 2026". */
export function fmtDateLocal(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Kurzer Wochentag, z. B. "Sa". */
export function fmtWeekdayShort(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('de-DE', { weekday: 'short' })
}

/** Tag-Index ( Tage seit 1970 ), für consecutive-Vergleiche. */
export function dayIndex(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / 86400000)
}

export function isNextDay(a: string, b: string): boolean {
  return dayIndex(a) - dayIndex(b) === 1
}

/** Vorheriger Tag als YYYY-MM-DD. */
export function dayBefore(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d - 1)
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
}

/** Die letzten 7 Tage, vom ältesten zum heutigen (für das Wochen-Chart). */
export function last7Days(): string[] {
  const today = todayLocal()
  const days: string[] = []
  let d = today
  for (let i = 0; i < 7; i++) days.push(d)
  for (let i = days.length - 1; i > 0; i--) {
    days[i - 1] = dayBefore(days[i])
  }
  return days
}

export function isSameDay(a: string, b: string): boolean {
  return a === b
}