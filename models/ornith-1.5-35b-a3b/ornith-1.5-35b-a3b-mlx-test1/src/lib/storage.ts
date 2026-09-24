/**
 * Versionierter Persistenzlayer basierend auf IndexedDB.
 *
 * Designziele:
 * - Daten werden als einzelnes, versioniertes JSON-Objekt gespeichert.
 *   Das macht Migrationen und Validierung einfach und vorhersehbar.
 * - Lesevorgänge werfen NIE. Bei jedem Fehler (DB gesperrt, Parser-Fehler,
 *   veraltetes/zugewürdetes Format) wird ein sicherer leerer Zustand zurückgegeben.
 * - Migrationsfunktion ist versioniert und erweiterbar.
 */
import type { Activity, DayProgress, StoredState } from './types';
import { SCHEMA_VERSION, emptyState } from './types';
import { sanitizeState } from './dayLogic';

const DB_NAME = 'pulseboard';
const DB_VERSION = 1;
const STORE = 'state';
const KEY = 'main';

/** Einmalige, lazy initialisierte Verbindungsreferenz. */
let cachedDB: IDBDatabase | null = null;
let initPromise: Promise<IDBDatabase> | null = null;

/** Öffnet (und ggf. migriert) die Datenbank. Kapselt alle Fehler. */
export function initStore(): Promise<IDBDatabase> {
  if (cachedDB) return Promise.resolve(cachedDB);
  if (initPromise) return initPromise;

  initPromise = new Promise<IDBDatabase>((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = () => {
        const db = req.result;
        // Erster Start oder Versionsprung: neue Stores anlegen, falls fehlend.
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'key' });
        }
      };

      req.onsuccess = () => {
        cachedDB = req.result;
        resolve(cachedDB);
      };

      req.onerror = () => {
        reject(new Error(`IndexedDB konnte nicht geöffnet werden: ${req.error?.message}`));
      };
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });

  return initPromise;
}

/** Liest den vollständigen, validierten und migrierten Zustand. Werf nie. */
export async function readState(): Promise<StoredState> {
  let db: IDBDatabase;
  try {
    db = await initStore();
  } catch {
    // Persistenz nicht verfügbar (z. B. Modus ohne Speicher). Start leer.
    return emptyState();
  }

  return new Promise<StoredState>((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.getStore();
      const req = store.get(KEY);

      req.onsuccess = () => {
        const raw = req.result ? req.result.value : undefined;
        resolve(migrateState(sanitizeState(raw)));
      };
      req.onerror = () => resolve(emptyState());
      tx.onerror = () => resolve(emptyState());
    } catch {
      resolve(emptyState());
    }
  });
}

/** Schreibt einen Zustand zurück. Werf nie – Fehler werden stillgeschleift. */
export async function writeState(state: StoredState): Promise<void> {
  let db: IDBDatabase;
  try {
    db = await initStore();
  } catch {
    return;
  }

  const payload = { key: KEY, value: state };
  try {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.getStore();
    store.put(payload);
    tx.oncomplete = () => {};
    tx.onerror = () => {};
  } catch {
    // Absichtlich swallowed: Persistenzfehler dürfen die App nicht crashen.
  }
}

/**
 * Wendet registrierte Migrationen an, falls die gespeicherte Version
 * kleiner als die aktuelle ist. Jede Migration ist isoliert try/catch-ed.
 */
function migrateState(state: StoredState): StoredState {
  if (typeof state.schemaVersion !== 'number' || state.schemaVersion < SCHEMA_VERSION) {
    let migrated = state;
    for (let v = state.schemaVersion; v < SCHEMA_VERSION; v += 1) {
      const fn = MIGRATIONS[v];
      if (!fn) break;
      try {
        migrated = fn(migrated);
      } catch {
        // Bei einer fehlgeschlagenen Migration wird mit dem bisherigen
        // (bereits sanitisierten) Zustand fortgefahren.
        break;
      }
    }
    migrated = { ...migrated, schemaVersion: SCHEMA_VERSION };
    return migrated;
  }
  return state;
}

/**
 * Migrationsliste, indiziert mit der URSPRUNG-Version.
 * Für v1 gibt es keine vorherige Version; hier nur das Muster für künftige
 * Versionen (z. B. v1 -> v2).
 */
const MIGRATIONS: Record<number, (s: StoredState) => StoredState> = {
  // 1: (Platzhalter für v1 -> v2)
};

// ---------------------------------------------------------------------------
// Bequeme CRUD-Helfer. Alle lesen den aktuellen Zustand, wenden die Änderung
// an und schreiben zurück.
// ---------------------------------------------------------------------------

export async function listActivities(): Promise<Activity[]> {
  const state = await readState();
  return state.activities;
}

export async function saveActivity(activity: Activity): Promise<Activity> {
  const state = await readState();
  const existingIndex = state.activities.findIndex((a) => a.id === activity.id);
  if (existingIndex >= 0) {
    const activities = [...state.activities];
    activities[existingIndex] = activity;
    state.activities = activities;
  } else {
    state.activities = [...state.activities, activity];
  }
  state.updatedAt = new Date().toISOString();
  await writeState(state);
  return activity;
}

export async function removeActivity(activityId: string): Promise<void> {
  const state = await readState();
  state.activities = state.activities.filter((a) => a.id !== activityId);
  // Verwaite Fortschrittseinträge entfernen (Platte schonen).
  for (const date of Object.keys(state.days)) {
    if (state.days[date][activityId] !== undefined) {
      const next = { ...state.days[date] };
      delete next[activityId];
      state.days[date] = next;
    }
  }
  state.updatedAt = new Date().toISOString();
  await writeState(state);
}

export async function getDayProgress(date: string): Promise<DayProgress> {
  const state = await readState();
  return state.days[date] ?? {};
}

export async function setDayProgress(
  date: string,
  progress: DayProgress,
): Promise<void> {
  const state = await readState();
  const next = { ...state.days, [date]: progress };
  state.days = next;
  state.updatedAt = new Date().toISOString();
  await writeState(state);
}

/** Leitet alle gespeicherten Daten (JSON-Export). */
export async function exportData(): Promise<string> {
  const state = await readState();
  return JSON.stringify(state, null, 2);
}

/** Schreibt einen exportierten Zustand zurück (Import). Werf nie. */
export async function importData(json: string): Promise<StoredState> {
  const sanitized = sanitizeState(safeParse(json));
  await writeState(sanitized);
  return sanitized;
}

function safeParse(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Schließt die Verbindung (hauptsächlich für Tests/nützliches Cleanup). */
export function closeStore(): void {
  try {
    cachedDB?.close();
  } catch {
    // ignore
  }
  cachedDB = null;
  initPromise = null;
}
