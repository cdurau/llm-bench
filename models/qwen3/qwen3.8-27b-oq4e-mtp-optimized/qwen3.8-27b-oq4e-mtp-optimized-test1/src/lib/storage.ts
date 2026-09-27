import type { Activity, AppData, DayProgress, Recovery } from './types';
import { NO_CATEGORY } from './types';
import { isValidKey } from './dates';

/** localStorage-Schlüssel für das Gesamtdokument. */
export const STORAGE_KEY = 'pulseboard:data';

/** Aktuelle Schema-Version; ältere Versionen werden von `migrate()` übernommen. */
export const SCHEMA_VERSION = 1;

/* ---------- kleine, strikte Typ-Wächter ---------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Positive ganze Zahl; `null` bei nichts Sinnvollem. */
function asPositiveInt(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  if (typeof value === 'string' && /^\d+$/.test(value) && Number(value) > 0) {
    return Number(value);
  }
  return fallback;
}

/**
 * Zählstand auf das sinnvolle Maß begrenzen.
 * `null` = Eintrag verwerfen (z. B. negative Zahl, NaN, kein Bezug mehr zur Aktivität).
 */
function asCount(value: unknown, target: number): number | null {
  if (!isNumber(value) && !(typeof value === 'string' && value !== '' && Number.isInteger(Number(value)))) {
    return null;
  }
  const n = Math.trunc(Number(value));
  if (Number.isNaN(n) || n < 0) return null;
  return Math.min(n, Math.max(target, 1));
}

/* ---------- Migration & Validierung ---------- */

/**
 * Migration alter Dokumente. Aktuell ist v1 die Anfangsversion, daher ist der
 * Durchlauf eine Identity – die Struktur ist aber vorbereitet, damit ein
 * Versionsbump (z. B. v1 → v2) nur eine Funktion hier ergänzt.
 */
export function migrate(raw: AppData): AppData {
  return { ...raw };
}

function sanitizeActivity(value: unknown, seenIds: Set<string>): Activity | null {
  if (!isRecord(value)) return null;
  const id = isString(value.id) && value.id !== '' ? value.id : null;
  if (!id || seenIds.has(id)) return null;
  const name = isString(value.name) ? value.name.trim() : '';
  if (name === '') return null; // ohne Namen nicht benutzbar → Eintrag fällt raus
  seenIds.add(id);

  return {
    id,
    name,
    description: isString(value.description) ? value.description.slice(0, 500) : '',
    category:
      isString(value.category) && value.category.trim() !== ''
        ? value.category.trim().slice(0, 60)
        : NO_CATEGORY,
    target: asPositiveInt(value.target, 1),
    createdAt: isString(value.createdAt) ? value.createdAt : '',
  };
}

function sanitizeDayProgress(value: unknown, activities: Map<string, Activity>): DayProgress | null {
  if (!isRecord(value)) return null;
  const out: DayProgress = {};
  for (const [activityId, rawCount] of Object.entries(value)) {
    const activity = activities.get(activityId);
    if (!activity) continue; // Referenz zu gelöschter/unbekannter Aktivität → verwerfen
    const count = asCount(rawCount, activity.target);
    if (count === null) continue;
    out[activityId] = count;
  }
  return out;
}

/**
 * Speichertes, beliebtes `unknown` in ein sicheres `AppData` verwandeln.
 *
 * - `null` → das Dokument ist nicht zu retten (unerwartete Struktur, kaputtes JSON,
 *   falsche Wurzeltypen). Die App startet leer und zeigt das an.
 * - sonst → best-effort gerettetes, normalisiertes Dokument; ungültige Einträge
 *   fallen raus, statt die App zu crashen.
 */
export function parseStored(raw: unknown): { data: AppData | null; migrated: boolean } {
  if (!isRecord(raw) || !isNumber(raw.version)) {
    return { data: null, migrated: false };
  }
  const before = Math.floor(raw.version as number);
  const migrated = before < SCHEMA_VERSION;

  const activities: Activity[] = [];
  const seenIds = new Set<string>();
  if (Array.isArray(raw.activities)) {
    for (const entry of raw.activities) {
      const activity = sanitizeActivity(entry, seenIds);
      if (activity) activities.push(activity);
    }
  }

  const activityMap = new Map(activities.map((a) => [a.id, a]));
  const progress: Record<string, DayProgress> = {};
  if (isRecord(raw.progress)) {
    for (const [day, rawDay] of Object.entries(raw.progress)) {
      if (!isValidKey(day)) continue; // fremde/ungültige Datums-Keys weg
      const dayProgress = sanitizeDayProgress(rawDay, activityMap);
      if (dayProgress && Object.keys(dayProgress).length > 0) progress[day] = dayProgress;
    }
  }

  const data: AppData = {
    version: SCHEMA_VERSION,
    activities,
    progress,
  };
  return { data: migrate(data), migrated };
}

/* ---------- Zugriff auf localStorage ---------- */

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Speicher unzugänglich (z. B. privater Modus mit deaktiviertem Storage) → leer.
    return null;
  }
}

/**
 * Gespeichertes Dokument laden. Crasht bei kaputten oder veralteten Daten nie:
 * - nichts gespeichert        → leeres Dokument, Recovery "empty"
 * - nicht lesbares JSON        → Recovery "corrupt"
 * - alte Version              → Daten + Recovery "migrated"
 * - sonst                     → Daten + Recovery "ok"
 */
export function load(): { data: AppData; recovery: Recovery } {
  const rawText = readRaw();
  if (rawText === null) {
    return { data: emptyData(), recovery: 'empty' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { data: emptyData(), recovery: 'corrupt' };
  }
  const { data, migrated } = parseStored(parsed);
  if (data === null) {
    return { data: emptyData(), recovery: 'corrupt' };
  }
  return {
    data,
    recovery: migrated ? 'migrated' : 'ok',
  };
}

/** Neues, leeres Dokument. */
export function emptyData(): AppData {
  return { version: SCHEMA_VERSION, activities: [], progress: {} };
}

/**
 * Dokument persistieren. Gibt `false`, wenn der Schreibzugriff fehlgeschlagen ist
 * (z. B. Speicher voll) – die App zeigt dann eine Meldung, statt zu crashen.
 */
export function save(data: AppData): boolean {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...data, version: SCHEMA_VERSION }),
    );
    return true;
  } catch {
    return false;
  }
}
