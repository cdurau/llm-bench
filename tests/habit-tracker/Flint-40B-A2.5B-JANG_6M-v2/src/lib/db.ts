import { openDB, type IDBPDatabase } from 'idb';
import type { Habit, HabitEntry, MoodEntry } from './types';

const DB_NAME = 'rhythm';
const DB_VERSION = 1;

export interface RhythmDB {
  habits: { key: string; value: Habit };
  entries: { key: string; value: HabitEntry };
  moods: { key: string; value: MoodEntry };
}

let dbPromise: Promise<IDBPDatabase<RhythmDB>> | null = null;

function openDb(): Promise<IDBPDatabase<RhythmDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RhythmDB>(DB_NAME, DB_VERSION, {
      upgrade: (db) => {
        db.createObjectStore('habits', { keyPath: 'id' });
        db.createObjectStore('entries', { keyPath: 'id' });
        db.createObjectStore('moods', { keyPath: 'date' });
      },
    });
  }
  return dbPromise;
}

export async function getHabits(): Promise<Habit[]> {
  const db = await openDb();
  return db.getAll('habits');
}

export async function putHabit(habit: Habit): Promise<void> {
  const db = await openDb();
  await db.put('habits', habit);
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await openDb();
  await db.delete('habits', id);
  const entries = await db.getAll('entries');
  await Promise.all(
    entries.filter((e) => e.habitId === id).map((e) => db.delete('entries', e.id)),
  );
}

export async function getAllEntries(): Promise<HabitEntry[]> {
  const db = await openDb();
  return db.getAll('entries');
}

export async function putEntry(entry: HabitEntry): Promise<void> {
  const db = await openDb();
  await db.put('entries', entry);
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await openDb();
  await db.delete('entries', id);
}

export async function getMoods(): Promise<MoodEntry[]> {
  const db = await openDb();
  return db.getAll('moods');
}

export async function saveMood(mood: MoodEntry): Promise<void> {
  const db = await openDb();
  await db.put('moods', mood);
}

export async function clearDatabase(): Promise<void> {
  const db = await openDb();
  await db.clear('habits');
  await db.clear('entries');
  await db.clear('moods');
}