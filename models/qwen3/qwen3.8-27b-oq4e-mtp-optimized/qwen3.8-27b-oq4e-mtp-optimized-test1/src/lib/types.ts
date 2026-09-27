/** Eine Aktivität: global definiert, jeden Tag separat abhakbar. */
export interface Activity {
  id: string;
  /** Anzeigename, Pflichtfeld. */
  name: string;
  /** Optionale Beschreibung; leerer String = keine. */
  description: string;
  /** Kategorie als Freitext; leere Eingabe wird als "Ohne Kategorie" gespeichert. */
  category: string;
  /**
   * Tagesziel als ganze Zahl ≥ 1.
   * 1 = einmal abhaken; > 1 = pro Klick zählen, fertig bei Erreichen des Ziels.
   */
  target: number;
  /** ISO-Zeitstempel der Anlage. */
  createdAt: string;
}

/** Fallback-Kategorie, wenn keine eingegeben wurde. */
export const NO_CATEGORY = 'Ohne Kategorie';

/** Kalenderdatum als lokale Zeit, Format `YYYY-MM-DD`. */
export type DayKey = string;

/** Zählstand pro Aktivität für einen Tag: activityId → Anzahl (0..target). */
export type DayProgress = Record<string, number>;

/**
 * Versioniertes Gesamtdokument, das in localStorage abgelegt wird.
 * `version` steigt bei Strukturwechseln; `storage.ts` migriert alte Versionen.
 */
export interface AppData {
  version: number;
  activities: Activity[];
  /** Tagesstatus strikt nach Datum getrennt – Tage überschreiben sich nie. */
  progress: Record<DayKey, DayProgress>;
}

/** Wie der gespeicherte Zustand beim Laden eingestuft wurde. */
export type Recovery = 'ok' | 'migrated' | 'corrupt' | 'empty';
