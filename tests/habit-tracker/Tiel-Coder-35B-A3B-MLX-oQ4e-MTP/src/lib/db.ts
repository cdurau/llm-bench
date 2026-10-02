import { openDB, type IDBPDatabase } from 'idb';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  completedDates: string[];
  createdAt: string;
}

export interface MoodEntry {
  date: string;
  value: number;
  note: string;
}

export interface AppState {
  habits: Habit[];
  moods: MoodEntry[];
}

const DB_NAME = 'rhythm-db';
const DB_VERSION = 1;
const STORE = 'state';
const STATE_KEY = 'app-state';

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    });
  }
  return dbPromise;
}

export async function loadState(): Promise<AppState> {
  const db = await getDB();
  const data = (await db.get(STORE, STATE_KEY)) as Partial<AppState> | null;
  return {
    habits: Array.isArray(data?.habits) ? data.habits : [],
    moods: Array.isArray(data?.moods) ? data.moods : [],
  };
}

export async function saveState(state: AppState): Promise<void> {
  const db = await getDB();
  await db.put(STORE, state, STATE_KEY);
}
