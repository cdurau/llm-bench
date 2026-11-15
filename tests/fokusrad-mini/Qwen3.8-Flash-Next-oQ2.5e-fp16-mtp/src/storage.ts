import { SEGMENT_COUNT } from './types'
import type { FocusWheel, Mood, ThemeMode, WheelDraft } from './types'

// Versionierte localStorage-Schicht: jeder Key trägt das Schema-Version-Tag (v1).
// Alle Loader validieren und normalisieren – ungültige gespeicherte Daten
// werden verworfen oder repariert und bringen die App nie zum Absturz.
const VERSION = 'v1'

export const KEYS = {
  archive: `fokusrad:${VERSION}:archive`,
  draft: `fokusrad:${VERSION}:draft`,
  theme: `fokusrad:${VERSION}:theme`,
} as const

export const newId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const MAX_TEXT = 400

const isMood = (v: unknown): v is Mood =>
  typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5

const cleanText = (v: unknown): string =>
  typeof v === 'string' ? v.trim().slice(0, MAX_TEXT) : ''

/** Gedankenliste auf genau 8 Slots normalisieren; '' bleibt hier erlaubt. */
const normalizeThoughts = (v: unknown): string[] | null => {
  if (!Array.isArray(v) || v.length > SEGMENT_COUNT) return null
  const list = v.map((s) => (typeof s === 'string' ? s.trim().slice(0, MAX_TEXT) : ''))
  while (list.length < SEGMENT_COUNT) list.push('')
  return list
}

export function parseDraft(v: unknown): WheelDraft | null {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  const thoughts = normalizeThoughts(o.thoughts)
  const initialThought = cleanText(o.initialThought)
  const targetThought = cleanText(o.targetThought)
  if (!thoughts || !initialThought || !targetThought) return null
  if (typeof o.id !== 'string' || !o.id || typeof o.createdAt !== 'string') return null
  if (!isMood(o.startMood)) return null
  return {
    id: o.id,
    createdAt: o.createdAt,
    initialThought,
    targetThought,
    startMood: o.startMood,
    thoughts,
  }
}

/** Abgeschlossenes Rad: alle 8 Sätze müssen gefüllt sein. */
export function parseWheel(v: unknown): FocusWheel | null {
  const base = parseDraft(v)
  if (!base) return null
  if (!base.thoughts.every((s) => s.length > 0)) return null
  const o = v as Record<string, unknown>
  if (typeof o.completedAt !== 'string' || !o.completedAt) return null
  if (!isMood(o.endMood)) return null
  return { ...base, completedAt: o.completedAt, endMood: o.endMood }
}

export function loadWheels(): FocusWheel[] {
  try {
    const raw = localStorage.getItem(KEYS.archive)
    if (!raw) return []
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.map(parseWheel).filter((w): w is FocusWheel => w !== null)
  } catch {
    return []
  }
}

export function saveWheels(wheels: FocusWheel[]): void {
  try {
    localStorage.setItem(KEYS.archive, JSON.stringify(wheels))
  } catch {
    // Quota-/Privacy-Fehler dürfen die App nicht stören.
  }
}

export function loadDraft(): WheelDraft | null {
  try {
    const raw = localStorage.getItem(KEYS.draft)
    if (!raw) return null
    return parseDraft(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveDraft(draft: WheelDraft | null): void {
  try {
    if (draft) localStorage.setItem(KEYS.draft, JSON.stringify(draft))
    else localStorage.removeItem(KEYS.draft)
  } catch {
    // wie oben
  }
}

export function loadTheme(): ThemeMode {
  try {
    const v = localStorage.getItem(KEYS.theme)
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function saveTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(KEYS.theme, mode)
  } catch {
    // wie oben
  }
}
