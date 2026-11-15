export type Mood = 1 | 2 | 3 | 4 | 5

export const SEGMENT_COUNT = 8

export const MOOD_LABELS: Record<Mood, string> = {
  1: 'Sehr belastet',
  2: 'Belastet',
  3: 'Gemischt',
  4: 'Leicht',
  5: 'Klar',
}

/** Abgeschlossenes Fokusrad (Archiv-Eintrag). */
export interface FocusWheel {
  id: string
  createdAt: string
  completedAt: string
  initialThought: string
  targetThought: string
  startMood: Mood
  endMood: Mood
  /** 8 überbrückende Sätze, alle nicht leer. */
  thoughts: string[]
}

/** Laufende (noch nicht abgeschlossene) Session – Entwurfs-Persistenz. */
export interface WheelDraft {
  id: string
  createdAt: string
  initialThought: string
  targetThought: string
  startMood: Mood
  /** 8 Slots; noch fehlende Gedanken sind ''. */
  thoughts: string[]
}

export type ThemeMode = 'light' | 'dark' | 'system'
