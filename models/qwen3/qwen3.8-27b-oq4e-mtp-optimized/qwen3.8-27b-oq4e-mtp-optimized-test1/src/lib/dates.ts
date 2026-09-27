import type { DayKey } from './types';
import { now } from './clock';

const KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `Date` → lokaler DayKey (`YYYY-MM-DD`). */
export function toKey(date: Date): DayKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** DayKey für "heute" (lokale Zeit). */
export function todayKey(at: Date = now()): DayKey {
  return toKey(at);
}

/** DayKey → `Date` auf 0:00 Uhr lokaler Zeit; ungültige Keys liefern `null`. */
export function fromKey(key: DayKey): Date | null {
  const m = KEY_RE.exec(key);
  if (!m) return null;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Strikt prüfen, ob der String ein gültiger lokaler Kalendertag ist. */
export function isValidKey(key: string): boolean {
  const date = fromKey(key);
  if (!date) return false;
  // fromKey normalisiert (z. B. 2026-02-31 → 3. März), deshalb rückprüfen.
  return toKey(date) === key;
}

/** DayKey um `delta` Tage verschieben (negativ erlaubt). */
export function addDays(key: DayKey, delta: number): DayKey {
  const date = fromKey(key) ?? new Date();
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + delta);
  return toKey(shifted);
}

/** Ist der Tag streng in der Zukunft (relativ zu `at`)? */
export function isFuture(key: DayKey, at: Date = now()): boolean {
  return key > todayKey(at);
}

/** Ist der Tag der heutige? */
export function isToday(key: DayKey, at: Date = now()): boolean {
  return key === todayKey(at);
}

/** "Donnerstag, 27. September" – lange Form für den Kopfbereich. */
export function formatLong(key: DayKey): string {
  const date = fromKey(key);
  if (!date) return key;
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

/** "27. Sep." – kurze Form. */
export function formatShort(key: DayKey): string {
  const date = fromKey(key);
  if (!date) return key;
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}
