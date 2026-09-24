/**
 * Kern-Datenmodell von PulseBoard.
 *
 * Alles ist bewusst klein gehalten: Aktivitäten und ihr Tagesfortschritt.
 * Die Versionierung der gespeicherten Daten lebt in `StoredState.schemaVersion`.
 */

/** Einmal pro Aktivität. Name ist Pflicht, alles andere optional. */
export interface Activity {
  /** Stabil UUID-artifizielle ID (nicht veränderbar durch den Nutzer). */
  id: string;
  /** Pflichtfeld. */
  name: string;
  /** Optional, frei text. */
  description: string;
  /** Kategorie zum Gruppieren / Filtern im Dashboard. */
  category: string;
  /**
   * Tagesziel als Zahl. 0 (oder kleiner) bedeutet "kein Ziel".
   * Der Fortschritt pro Tag kann diesen Wert überschreiten.
   */
  dailyGoal: number;
  /** Optionaler ISO-Erstelldatum, rein informativ. */
  createdAt: string;
}

/**
 * Fortschritt eines Tages: { activityId : erledigteAnzahl }.
 * 0 = nicht erledigt, >=1 = erledigt (n-fach bei Tagesziel > 1).
 */
export type DayProgress = Record<string, number>;

/** Vollständiger, versionierter Zustand, wie er persistiert wird. */
export interface StoredState {
  schemaVersion: number;
  activities: Activity[];
  /** { date(YYYY-MM-DD) : DayProgress } */
  days: Record<string, DayProgress>;
  updatedAt: string;
}

export const SCHEMA_VERSION = 1;

/** Leerer Ausgangszustand. */
export function emptyState(): StoredState {
  return {
    schemaVersion: SCHEMA_VERSION,
    activities: [],
    days: {},
    updatedAt: new Date().toISOString(),
  };
}
