import type { AppState, FocusWheel, ThemePreference } from './types'
import { SEGMENT_COUNT, clampMood } from './types'

/** Versionsnummer der Speicherschicht. */
export const STATE_VERSION = 1

/** Schlüssel des versionierten `localStorage`-Zustands. */
export const STORAGE_KEY = `fokusrad:v${STATE_VERSION}:state`

/** Obergrenzen für Textfelder – schützt gegen kaputt gewordene/gigantische Einträge. */
const LIMITS = {
  startThought: 1000,
  targetThought: 500,
  segment: 400
} as const

export function createEmptyState(): AppState {
  return {
    version: STATE_VERSION,
    theme: 'system',
    wheels: [],
    draft: null
  }
}

/* ------------------------------------------------------------------ */
/* Sanitisierung: Ungültige gespeicherte Daten dürfen die App nie       */
/* zum Absturz bringen – alles Unerwartbare wird still bereinigt.      */
/* ------------------------------------------------------------------ */

function sanitizeText(value: unknown, limit: number): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  return trimmed.length > limit ? trimmed.slice(0, limit) : trimmed
}

function sanitizeIsoDate(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : value
}

function sanitizeTheme(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system'
}

function sanitizeWheel(raw: unknown): FocusWheel | null {
  if (typeof raw !== 'object' || raw === null) return null
  const record = raw as Record<string, unknown>

  if (typeof record.id !== 'string' || record.id.length === 0) return null

  const rawSegments = Array.isArray(record.segments) ? record.segments : []
  const segments: string[] = []
  for (let i = 0; i < SEGMENT_COUNT; i++) {
    segments.push(sanitizeText(rawSegments[i] ?? '', LIMITS.segment))
  }

  const completedAt = sanitizeIsoDate(record.completedAt)
  const createdAt = sanitizeIsoDate(record.createdAt) ?? new Date().toISOString()

  return {
    id: record.id.slice(0, 128),
    createdAt,
    completedAt,
    startThought: sanitizeText(record.startThought, LIMITS.startThought),
    targetThought: sanitizeText(record.targetThought, LIMITS.targetThought),
    startMood: clampMood(record.startMood),
    endMood: completedAt !== null ? clampMood(record.endMood) : null,
    segments
  }
}

function sanitizeWheels(raw: unknown): FocusWheel[] {
  if (!Array.isArray(raw)) return []
  const wheels: FocusWheel[] = []
  for (const entry of raw) {
    const wheel = sanitizeWheel(entry)
    if (wheel !== null) wheels.push(wheel)
  }
  // Neueste zuerst.
  return wheels.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

/**
 * Lädt den App-Zustand aus `localStorage`.
 * Fehlt, ist kaputt oder eine unbekannte Version: ein leerer, gültiger
 * Zustand wird zurückgegeben (bestefforts-Rettung von Rad-Daten).
 */
export function loadState(): AppState {
  const fallback = createEmptyState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return fallback

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return fallback

    const record = parsed as Record<string, unknown>

    // Unbekannte Version: Daten best-efforts retten und unter der
    // aktuellen Versionsnummer neu ablegen.

    const draftRaw = record.draft
    let draft =
      draftRaw === null || draftRaw === undefined
        ? null
        : sanitizeWheel(draftRaw)

    const wheels = sanitizeWheels(record.wheels)

    // Ein "abgeschlossenes" Rad, das aus Versehen im Entwurfs-Slot liegt,
    // wandert in den Verlauf.
    if (draft !== null && draft.completedAt !== null) {
      wheels.push(draft)
      wheels.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      draft = null
    }

    return {
      version: STATE_VERSION,
      theme: sanitizeTheme(record.theme),
      wheels,
      draft
    }
  } catch {
    return fallback
  }
}

/**
 * Schreibt den Zustand nach `localStorage`.
 * Fehler (z. B. Speicherplatz, privater Modus) bleiben still: die App
 * läuft im laufenden Speicher weiter, der Datenverlust betrifft nur das
 * nächste Neuladen.
 */
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* bewusst still – siehe Kommentar oben */
  }
}

/** Löscht den gesamten gespeicherten Zustand (z. B. zum Zurücksetzen). */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* still */
  }
}
