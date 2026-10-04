import { openDB } from 'idb';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
}

export interface Mood {
  value: number;
  notiz?: string;
}

let dbPromise: Promise<import('idb').IDBPDatabase> | undefined;

function getDb(): Promise<import('idb').IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB('rhythm-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('completions')) {
          db.createObjectStore('completions');
        }
        if (!db.objectStoreNames.contains('moods')) {
          db.createObjectStore('moods');
        }
      },
    });
  }
  return dbPromise;
}

export function completionKey(habitId: string, dateKey: string): string {
  return `${habitId}|${dateKey}`;
}

export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDb();
  const habits = (await db.getAll('habits')) as Habit[];
  return habits.sort((a, b) => (a.name.localeCompare(b.name, 'de')));
}

export async function saveHabit(habit: Habit): Promise<void> {
  const db = await getDb();
  await db.put('habits', habit);
}

export async function deleteHabit(habitId: string): Promise<void> {
  const db = await getDb();
  await db.delete('habits', habitId);
  const keys = (await db.getAllKeys('completions')).map(String);
  await Promise.all(
    keys
      .filter((k) => k.startsWith(`${habitId}|`))
      .map((k) => db.delete('completions', k)),
  );
}

export async function getCompletedDates(
  habitId: string,
  dateKey: string,
): Promise<boolean> {
  const db = await getDb();
  return (await db.get('completions', completionKey(habitId, dateKey))) === true;
}

export async function getCompletionDates(habitId: string): Promise<Set<string>> {
  const db = await getDb();
  const out = new Set<string>();
  const keys = (await db.getAllKeys('completions')).map(String);
  await Promise.all(
    keys
      .filter((k) => k.startsWith(`${habitId}|`))
      .map(async (k) => {
        if ((await db.get('completions', k)) === true) {
          out.add(k.slice(habitId.length + 1));
        }
      }),
  );
  return out;
}

export async function setDone(
  habitId: string,
  dateKey: string,
  done: boolean,
): Promise<void> {
  const db = await getDb();
  const key = completionKey(habitId, dateKey);
  if (done) await db.put('completions', true, key);
  else await db.delete('completions', key);
}

export async function getMood(dateKey: string): Promise<Mood | undefined> {
  const db = await getDb();
  return await db.get('moods', dateKey) as Mood | undefined;
}

export async function setMood(
  dateKey: string,
  mood: Mood | null,
): Promise<void> {
  const db = await getDb();
  if (mood) await db.put('moods', mood, dateKey);
  else await db.delete('moods', dateKey);
}
