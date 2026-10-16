import { openDB } from 'idb';
import type { IDBPDatabase, DBSchema } from 'idb';
import type {
  Habit,
  MoodEntry,
  DarkMode,
} from './types';

interface RhythmDB extends DBSchema {
  habits: {
    key: string;
    value: Habit & { createdAt: number };
    indexes: { createdAt: number };
  };
  checks: {
    key: string;
    value: { id: string; habitId: string; date: string };
    indexes: { date: string; habitId: string };
  };
  mood: {
    key: string;
    value: MoodEntry;
    indexes: { date: string };
  };
  settings: {
    key: string;
    value: { key: string; value: unknown };
  };
}

const DB_NAME = 'rhythm';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<RhythmDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<RhythmDB>(DB_NAME, DB_VERSION, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains('habits')) {
          const hs = db.createObjectStore('habits', { keyPath: 'id' });
          hs.createIndex('createdAt', 'createdAt');
        }
        if (!db.objectStoreNames.contains('checks')) {
          const cs = db.createObjectStore('checks', { keyPath: 'id' });
          cs.createIndex('date', 'date');
          cs.createIndex('habitId', 'habitId');
        }
        if (!db.objectStoreNames.contains('mood')) {
          const ms = db.createObjectStore('mood', { keyPath: 'id' });
          ms.createIndex('date', 'date');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

/* ── Habits ──────────────────────────────── */

export async function getHabits() {
  const db = await getDb();
  const tx = db.transaction('habits', 'readonly');
  return tx.store.getAll();
}

export async function addHabit(
  habit: Omit<Habit, 'id' | 'createdAt'>
): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const db = await getDb();
  const tx = db.transaction('habits', 'readwrite');
  await tx.store.add({ ...habit, id, createdAt: now });
  await tx.done;
  return id;
}

export async function updateHabit(
  id: string,
  patch: Partial<Pick<Habit, 'name' | 'color' | 'icon'>>
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('habits', 'readwrite');
  const record = await tx.store.get(id);
  if (record) {
    Object.assign(record, patch);
    await tx.store.put(record);
  }
  await tx.done;
}

export async function deleteHabit(id: string) {
  const db2 = await getDb();
  const tx1 = db2.transaction('habits', 'readwrite');
  await tx1.store.delete(id);
  const tx2 = db2.transaction('checks', 'readwrite');
  const checks = await tx2.store.getAll();
  for (const c of checks) {
    if (c.habitId === id) {
      await tx2.store.delete(c.id);
    }
  }
  await Promise.all([tx1.done, tx2.done]);
}

/* ── Checks ──────────────────────────────── */

export async function checkHabit(
  habitId: string,
  date: string
) {
  const db = await getDb();
  const tx = db.transaction('checks', 'readwrite');
  const key = `${date}:${habitId}`;
  await tx.store.put({ id: key, habitId, date });
  await tx.done;
}

export async function uncheckHabit(habitId: string, date: string) {
  const db = await getDb();
  const tx = db.transaction('checks', 'readwrite');
  await tx.store.delete(`${date}:${habitId}`);
  await tx.done;
}

export async function getChecksForDate(date: string) {
  const db = await getDb();
  const tx = db.transaction('checks', 'readonly');
  const all = await tx.store.index('date').getAll(date);
  return all;
}

/* ── Mood ────────────────────────────────── */

export async function saveMoodEntry(
  mood: MoodEntry['mood'],
  note: string
): Promise<string> {
  const date = today();
  const db = await getDb();
  const tx = db.transaction('mood', 'readwrite');
  const existing = await tx.store.index('date').get(date);
  if (existing) {
    await tx.store.delete(existing.id);
  }
  const id = `${date}:mood`;
  await tx.store.add({ id, date, mood, note });
  await tx.done;
  return id;
}

export async function getMoodEntry(date: string) {
  const db = await getDb();
  const tx = db.transaction('mood', 'readonly');
  return tx.store.index('date').get(date);
}

/* ── Settings ──────────────────────────────── */

export async function getDarkMode(): Promise<DarkMode> {
  const db = await getDb();
  const tx = db.transaction('settings', 'readonly');
  const record = await tx.store.get('darkMode');
  return record?.value as DarkMode ?? 'system';
}

export async function setDarkMode(mode: DarkMode) {
  const db = await getDb();
  const tx = db.transaction('settings', 'readwrite');
  await tx.store.put({ key: 'darkMode', value: mode });
  await tx.done;
}

/* ── Helpers ──────────────────────────────── */

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function lastXDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => daysAgo(i));
}

export function daysAgo(offset: number): string {
  const d = new Date(Date.now() - offset * 86400000);
  return d.toISOString().slice(0, 10);
}

export function isToday(date: string): boolean {
  return date === today();
}
