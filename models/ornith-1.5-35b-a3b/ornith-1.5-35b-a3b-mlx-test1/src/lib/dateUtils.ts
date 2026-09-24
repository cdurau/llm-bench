/**
 * Kleines Datumshilfsmodul. Alle Datumsangaben werden intern als
 * 'YYYY-MM-DD' im LOKALEN Zeitformat gespeichert, damit ein Tag auf allen
 * Geräten konsistent ist und sich verschiedene Tage nicht überschreiben.
 */

/** Gibt das heutige Datum als 'YYYY-MM-DD' im lokalen Zeitformat zurück. */
export function todayLocal(): string {
  return formatDate(new Date());
}

/** Formatiert ein Datum als 'YYYY-MM-DD' im lokalen Zeitformat. */
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Addiert (oder subtriert) ganztägige Schritte zu einem 'YYYY-MM-DD'-String. */
export function addDays(date: string, steps: number): string {
  const d = parseLocal(date);
  if (!d) return date;
  d.setDate(d.getDate() + steps);
  return formatDate(d);
}

/** Liest einen 'YYYY-MM-DD'-String in ein lokales Datum. Ungültig => null. */
export function parseLocal(date: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  // Verhindert stille Roll-over (z. B. 2021-02-31 -> März).
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return dt;
}

/** Menschliches Format für die Tagesnavigation, z. B. "Donnerstag, 24. Sep.". */
export function formatDayLabel(date: string): string {
  const d = parseLocal(date);
  if (!d) return date;
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/** "Heute"/"Gestern"/"Morgen" oder Datum, je nach Nähe zum heutigen Tag. */
export function formatDayShort(date: string): string {
  const d = parseLocal(date);
  if (!d) return date;
  const today = parseLocal(todayLocal());
  if (!today) return date;
  const diff = Math.round(
    (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return 'Heute';
  if (diff === -1) return 'Gestern';
  if (diff === 1) return 'Morgen';
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
  }).format(d);
}

/** Ob ein Datum heute oder in der Zukunft liegt. */
export function isFuture(date: string): boolean {
  const d = parseLocal(date);
  const today = parseLocal(todayLocal());
  if (!d || !today) return false;
  return d.getTime() > today.getTime();
}
