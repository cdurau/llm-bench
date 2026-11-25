// --- IndexedDB data layer (idb) ---

import { openDB } from 'idb'; import type { DBSchema, IDBPDatabase } from 'idb';
import type { Habit, HabitLog, MoodEntry } from './types';

const DB_NAME = 'rhythm-db';
const DB_VERSION = 1;

interface RhythmDB extends DBSchema {
  habits: { key: string; value: Habit };
  logs: {
    key: string;
    value: HabitLog;
    indexes: { 'by-habit-date': [string, string]; 'by-date': string };
  };
  moods: { key: string; value: MoodEntry };
}

let dbPromise: Promise<IDBPDatabase<RhythmDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<RhythmDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RhythmDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const habitStore = db.createObjectStore('habits', { keyPath: 'id' });
        void habitStore;
        const logStore = db.createObjectStore('logs', { keyPath: 'id' });
        logStore.createIndex('by-habit-date', ['habitId', 'date']);
        logStore.createIndex('by-date', 'date');
        const moodStore = db.createObjectStore('moods', { keyPath: 'date' });
        void moodStore;
      },
    });
  }
  return dbPromise;
}

// --- Habits ---

export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDB();
  return db.getAll('habits');
}

export async function addHabit(habit: Omit<Habit, 'id'>): Promise<Habit> {
  const db = await getDB();
  const full = { ...habit, id: crypto.randomUUID() };
  await db.put('habits', full);
  return full;
}

export async function updateHabit(habit: Habit): Promise<void> {
  const db = await getDB();
  await db.put('habits', habit);
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('habits', id);
  const logs = await db.getAllFromIndex('logs', 'by-habit-date', IDBKeyRange.bound([id], [id, '\uffff']));
  for (const log of logs) await db.delete('logs', log.id);
}

// --- Logs ---

export async function addHabitLog(habitId: string, date: string): Promise<void> {
  const db = await getDB();
  const id = `${habitId}:${date}`;
  await db.put('logs', { id, habitId, date });
}

export async function removeHabitLog(habitId: string, date: string): Promise<void> {
  const db = await getDB();
  await db.delete('logs', `${habitId}:${date}`);
}

export async function getCompletedDates(habitId: string, dates: string[]): Promise<Set<string>> {
  const db = await getDB();
  const index = db.transaction('logs').store.index('by-habit-date');
  const cursor = await index.openCursor(IDBKeyRange.bound([habitId], [habitId, '\uffff']));
  const set = new Set<string>();
  const wanted = new Set(dates);
  while (cursor) {
    if (wanted.has(cursor.value.date)) set.add(cursor.value.date);
    cursor.advance(1);
  }
  return set;
}

export async function getCompletedDatesRange(habitId: string, from: string, to: string): Promise<Set<string>> {
  const db = await getDB();
  const index = db.transaction('logs').store.index('by-habit-date');
  const cursor = await index.openCursor(IDBKeyRange.bound([habitId, from], [habitId, to]));
  const set = new Set<string>();
  while (cursor) {
    set.add(cursor.value.date);
    cursor.advance(1);
  }
  return set;
}

// --- Moods ---

export async function getMood(date: string): Promise<MoodEntry | null> {
  const db = await getDB();
  return (await db.get('moods', date)) ?? null;
}

export async function saveMood(entry: MoodEntry): Promise<void> {
  const db = await getDB();
  await db.put('moods', entry);
}

export async function getAllMoods(): Promise<MoodEntry[]> {
  const db = await getDB();
  return db.getAll('moods');
}

// --- Daten löschen (Einstellungen) ---

export async function clearAll(): Promise<void> {
  const db = await getDB();
  await db.clear('habits');
  await db.clear('logs');
  await db.clear('moods');
}
