/** Anzahl der Segmente eines Fokusrads – fest durch die Methode vorgegeben. */
export const SEGMENT_COUNT = 8

/** Dauer eines Fokusrads in Sekunden (5 Minuten). */
export const WHEEL_DURATION_SECONDS = 5 * 60

/** Gewünschte Darstellung des Themas. */
export type ThemePreference = 'light' | 'dark' | 'system'

/**
 * Ein Fokusrad.
 * `completedAt === null` bezeichnet eine laufende (noch offene) Session,
 * die als Entwurf in `localStorage` zwischengespeichert wird.
 */
export interface FocusWheel {
  id: string
  /** ISO-Zeitstempel der Eröffnung. */
  createdAt: string
  /** ISO-Zeitstempel des Abschlusses, `null` solange die Session läuft. */
  completedAt: string | null
  /** Ausgangsgedanke / aktuelles Gefühl (was gerade stört oder drückt). */
  startThought: string
  /** Zielgedanke / Wunschgefühl (steht im Zentrum des Rads). */
  targetThought: string
  /** Start-Stimmung auf einer Skala von 1 bis 5. */
  startMood: number
  /** End-Stimmung auf einer Skala von 1 bis 5, `null` vor dem Abschluss. */
  endMood: number | null
  /** Die acht überbrückenden, entlastenden Sätze (Segment 1 bis 8). */
  segments: string[]
}

/** Gesamter, persistierter Zustand der App. */
export interface AppState {
  /** Versionsnummer der Speicherschicht (Migrationsschutz). */
  version: number
  theme: ThemePreference
  /** Abgeschlossene Fokusräder, neueste zuerst. */
  wheels: FocusWheel[]
  /** Laufende Session bzw. `null`. */
  draft: FocusWheel | null
}

/** Kurz-Labels für die 5-Punkte-Stimmungsskala (Index 0 = Stimmung 1). */
export const MOOD_LABELS = [
  'stark belastet',
  'angespannt',
  'neutrale Mitte',
  'ausgeglichen',
  'sehr ruhig'
] as const

/** Ruhige Wortung der Stimmungsänderung, z. B. „+2 – ein spürbarer Shift". */
export function moodDeltaLabel(start: number, end: number | null): string | null {
  if (end === null) return null
  const delta = clampMood(end) - clampMood(start)
  if (delta > 0) return `+${delta} – ein spürbarer Shift`
  if (delta < 0) return `${delta} – ein schwererer Tag, danke für die Ehrlichkeit`
  return 'geblieben – auch das zählt'
}

/** Stellt sicher, dass eine Stimmung immer im Bereich 1–5 liegt. */
export function clampMood(value: unknown): number {
  const n = typeof value === 'number' ? Math.round(value) : Number(value)
  if (!Number.isFinite(n)) return 3
  return Math.min(5, Math.max(1, n))
}

/** Zählt gefüllte Segmente eines Rads. */
export function filledSegmentCount(wheel: Pick<FocusWheel, 'segments'>): number {
  return wheel.segments.filter((s) => s.trim().length > 0).length
}

/** Erzeugt eine frische, noch leere Session. */
export function createDraft(
  startThought: string,
  targetThought: string,
  startMood: number
): FocusWheel {
  const now = new Date().toISOString()
  return {
    id: newWheelId(),
    createdAt: now,
    completedAt: null,
    startThought: startThought.trim(),
    targetThought: targetThought.trim(),
    startMood: clampMood(startMood),
    endMood: null,
    segments: Array<string>(SEGMENT_COUNT).fill('')
  }
}

/** Erzeugt eine eindeutige Kennung (mit Fallback für ältere Browser). */
export function newWheelId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch {
    /* Fallback unten */
  }
  return `wheel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
