/**
 * Hilfsfunktionen für Datumsberechnungen.
 * Intern werden Datumsketten im Format YYYY-MM-DD (lokal) verwendet, damit
 * verschiedene Kalendertage sauber getrennt bleiben und es durch
 * Zeitzonen-/Sommerzeit-Umbuchungen keine Randfälle gibt.
 */

/** Liefert den aktuellen Tag als YYYY-MM-DD-Kette (lokal). */
export function todayKey(date: Date = new Date()): string {
  return dateToKey(date)
}

/** Wandelt ein lokales Date-Objekt in eine YYYY-MM-DD-Kette um. */
export function dateToKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Wandelt eine YYYY-MM-DD-Kette in ein lokales Date (Mitternacht) um. */
export function keyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  // Monatsindex in JS ist 0-basiert.
  return new Date(y, m - 1, d)
}

/** Addiert (oder subtrahiert) ganze Tage zu einer Kette. vermeidet DST-Sprünge. */
export function addDays(key: string, days: number): string {
  const date = keyToDate(key)
  date.setDate(date.getDate() + days)
  return dateToKey(date)
}

/** Ist der Tag strictly nach dem heutigen Tag? */
export function isFuture(key: string, today: string = todayKey()): boolean {
  return key > today
}

/** Ist der Tag der heutige? */
export function isToday(key: string, today: string = todayKey()): boolean {
  return key === today
}

/**
 * Menschlich lesbares Label für einen Tag relativ zu "heute".
 * Nutzt Intl.DateTimeFormat für eine saubere, lokale Formatierung.
 */
export function formatDayLabel(key: string, today: string = todayKey()): string {
  const date = keyToDate(key)
  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }

  if (isToday(key, today)) {
    return 'Heute'
  }

  const yesterday = addDays(today, -1)
  const tomorrow = addDays(today, 1)
  if (key === yesterday) return 'Gestern'
  if (key === tomorrow) return 'Morgen'

  return new Intl.DateTimeFormat('de-DE', opts).format(date)
}

/** Saubere, kurze Formatierung z. B. für die Navigationsleiste. */
export function formatShort(key: string): string {
  const date = keyToDate(key)
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}
