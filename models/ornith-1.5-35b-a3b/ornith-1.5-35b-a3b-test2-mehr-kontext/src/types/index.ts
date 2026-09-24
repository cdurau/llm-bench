/**
 * Zentrale Datentypen für PulseBoard.
 * Die Datenstruktur ist versioniert, um Migrationen und das sichere
 * Laden von veralteten oder ungültigen gespeicherten Daten zu ermöglichen.
 */

export interface Activity {
  /** Universell eindeutige ID der Aktivität. */
  id: string
  /** Anzeigename. Muss nach Trimmen nicht leer sein. */
  name: string
  /** Optionale, ausführlichere Beschreibung. */
  description: string
  /** Kategorie zum Gruppieren (z. B. "Sport", "Arbeit"). */
  category: string
  /**
   * Tagesziel: wie oft die Aktivität pro Tag erreicht werden soll.
   * 0 bedeutet "kein Ziel" (ein einfacher Ein-/Aus-Schalter).
   */
  dailyTarget: number
  /** ISO-Timestamp des Anlegedatums. */
  createdAt: string
}

/**
 * Abgehakte Aktivitäten pro Kalendertag.
 * Key: Tag im Format YYYY-MM-DD (lokal).
 * Wert: Anzahl erledigter Einträge je Aktivitäts-ID für diesen Tag.
 */
export type Completions = Record<string, Record<string, number>>

/** Aktuelle, unterstützte Schema-Version. */
export const STORAGE_VERSION = 1

/** Schlüssel unter dem alle Daten im Storage abgelegt werden. */
export const STORAGE_KEY = 'pulseboard'

/** Vollständige, versionierte Datenstruktur. */
export interface StorageData {
  version: number
  activities: Record<string, Activity>
  completions: Completions
}

export interface NewActivityInput {
  name: string
  description?: string
  category: string
  dailyTarget?: number
}

export type ActivityInput = NewActivityInput
