/**
 * Persistenzschicht für PulseBoard.
 *
 * Verantwortlichkeiten:
 * - Lesen/Schreiben einer versionierten Datenstruktur in einem Storage-Backend
 *   (Standard: localStorage).
 * - Migration von älteren Schema-Versionen (aktuell v0 -> v1).
 * - Robustheit: ungültige, veraltete oder beschädigte Daten dürfen nie zum
 *   Absturz führen. Stattdessen wird sicher ein leerer Ausgangszustand
 *   verwendet.
 */

import type { Activity, Completions, NewActivityInput, StorageData } from '../types'
import { STORAGE_KEY, STORAGE_VERSION } from '../types'

/** Minimaler Storage-Contract, um Tests mit einem In-Memory-Backend zu ermöglichen. */
export interface StorageBackend {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
}

export const defaultBackend: StorageBackend = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, value),
  remove: (key) => localStorage.removeItem(key),
}

/** Erstellt einen sauberen, leeren Ausgangszustand der aktuellen Version. */
export function createEmptyData(): StorageData {
  return { version: STORAGE_VERSION, activities: {}, completions: {} }
}

// ---------------------------------------------------------------------------
// Validierung & Migration
// ---------------------------------------------------------------------------

function isValidActivity(value: unknown): value is Activity {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const a = value as Record<string, unknown>
  return (
    typeof a.id === 'string' &&
    typeof a.name === 'string' &&
    typeof a.description === 'string' &&
    typeof a.category === 'string' &&
    typeof a.dailyTarget === 'number' &&
    Number.isFinite(a.dailyTarget) &&
    typeof a.createdAt === 'string'
  )
}

function normalizeActivities(value: unknown): Record<string, Activity> {
  const result: Record<string, Activity> = {}
  if (value == null) {
    return result
  }
  const entries = Array.isArray(value) ? value : Object.values(value as object)
  for (const entry of entries) {
    if (isValidActivity(entry)) {
      // Sicherheit: Tagesziel nie negativ.
      entry.dailyTarget = Math.max(0, entry.dailyTarget)
      result[entry.id] = entry
    }
  }
  return result
}

function normalizeCompletions(value: unknown): Completions {
  const result: Completions = {}
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return result
  }
  for (const [date, perDay] of Object.entries(value as Record<string, unknown>)) {
    if (typeof perDay !== 'object' || perDay == null || Array.isArray(perDay)) {
      continue
    }
    const counts: Record<string, number> = {}
    for (const [activityId, count] of Object.entries(perDay as Record<string, unknown>)) {
      if (typeof count === 'number' && Number.isFinite(count) && count > 0) {
        counts[activityId] = Math.floor(count)
      }
    }
    if (Object.keys(counts).length > 0) {
      result[date] = counts
    }
  }
  return result
}

/**
 * Konvertiert eine v0-Datenstruktur (Array-basiert) in das v1-Objekt-Format.
 * Gibt `null` zurück, wenn die Grundstruktur nicht verwendbar ist.
 */
function migrateV0(parsed: Record<string, unknown>): StorageData | null {
  const activities = normalizeActivities(parsed.activities)
  const completions = normalizeCompletions(parsed.completions)
  return { version: STORAGE_VERSION, activities, completions }
}

/**
 * Validiert und migriert einen geparsten Wert.
 * Gibt `null` zurück, wenn die Struktur grundsätzlich unhambarrlich ist
 * (z. B. Zahl, String, Array auf Top-Ebene, unbekannte Version).
 */
export function parseStored(raw: string | null): StorageData | null {
  if (!raw) {
    return createEmptyData()
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    // Beschädigtes JSON -> sicher leer, kein Absturz.
    return null
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return null
  }

  const record = parsed as Record<string, unknown>
  const version = typeof record.version === 'number' ? record.version : STORAGE_VERSION

  if (version === STORAGE_VERSION) {
    const activities = normalizeActivities(record.activities)
    const completions = normalizeCompletions(record.completions)
    return { version: STORAGE_VERSION, activities, completions }
  }

  if (version === 0) {
    return migrateV0(record)
  }

  // Unbekannte/zukünftige Version -> zurücksetzen, aber nicht abstürzen.
  return null
}

// ---------------------------------------------------------------------------
// Lese-/Schreiboperationen
// ---------------------------------------------------------------------------

/** Liest und normalisiert die gespeicherten Daten aus dem Backend. */
export function readStored(backend: StorageBackend = defaultBackend): StorageData {
  const parsed = parseStored(backend.get(STORAGE_KEY))
  return parsed ?? createEmptyData()
}

/** Schreibt die Daten serialisiert ins Backend und fängt Fehler ab. */
export function writeStored(data: StorageData, backend: StorageBackend = defaultBackend): void {
  try {
    backend.set(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Z. B. Speicherlimit oder gesperrter Storage: nicht kritisch für die App.
  }
}

export function clearStored(backend: StorageBackend = defaultBackend): void {
  try {
    backend.remove(STORAGE_KEY)
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Validierung von Aktivitäts-Eingaben
// ---------------------------------------------------------------------------

export interface ValidatedActivity {
  ok: true
  activity: Activity
}

export interface InvalidActivity {
  ok: false
  error: string
}

export type ValidationResult = ValidatedActivity | InvalidActivity

/**
 * Prüft und normalisiert eine Aktivitäts-Eingabe.
 * Gibt eine Fehlermeldung zurück, wenn die Eingabe ungült ist.
 */
export function validateActivity(
  input: NewActivityInput,
  overrides: Partial<Activity>,
): ValidationResult {
  const name = (input.name ?? '').trim()
  const category = (input.category ?? '').trim()
  const description = (input.description ?? '').trim()

  let dailyTarget = 0
  if (input.dailyTarget !== undefined && input.dailyTarget !== null) {
    const value = Number(input.dailyTarget)
    if (Number.isFinite(value) && value >= 0) {
      dailyTarget = Math.floor(value)
    } else {
      return { ok: false, error: 'Tagesziel muss eine Zahl größer oder gleich 0 sein.' }
    }
  }

  if (name.length === 0) {
    return { ok: false, error: 'Bitte gib einen Name ein.' }
  }
  if (category.length === 0) {
    return { ok: false, error: 'Bitte wähle eine Kategorie aus.' }
  }

  return {
    ok: true,
    activity: {
      id: overrides.id ?? crypto.randomUUID(),
      name,
      description,
      category,
      dailyTarget,
      createdAt: overrides.createdAt ?? new Date().toISOString(),
    },
  }
}
