import { openDB, type IDBPDatabase } from 'idb';

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: number;
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
};

export type MoodLog = {
  id: string;
  date: string; // YYYY-MM-DD
  score: number; // 1-5
  note?: string;
};

export type AppSettings = {
  id: string;
  darkMode: boolean;
};

export interface IDBPStore<T, K> {
  get(key: K): Promise<T | undefined>;
  getAll(): Promise<T[]>;
  put(value: T): Promise<void>;
  delete(key: K): Promise<void>;
  clear(): Promise<void>;
}

export interface RhythmDB extends IDBPDatabase {
  habits: IDBPStore<Habit, string>;
  habitLogs: IDBPStore<HabitLog, string>;
  moodLogs: IDBPStore<MoodLog, string>;
  settings: IDBPStore<AppSettings, string>;
}

export async function initDB(): Promise<RhythmDB> {
  const db = await openDB('rhythm-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('habits')) {
        db.createObjectStore('habits', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('habitLogs')) {
        const store = db.createObjectStore('habitLogs', { keyPath: 'id' });
        store.createIndex('habitId', 'habitId');
        store.createIndex('date', 'date');
      }
      if (!db.objectStoreNames.contains('moodLogs')) {
        const store = db.createObjectStore('moodLogs', { keyPath: 'id' });
        store.createIndex('date', 'date');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    },
  });
  return db as unknown as RhythmDB;
}
