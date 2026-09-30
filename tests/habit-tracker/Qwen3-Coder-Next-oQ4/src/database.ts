import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Habit, StreakRecord, MoodRecord, AppState, Mood } from './types';

const DB_NAME = 'rhythm-db';
const DB_VERSION = 1;

interface RhythmDB extends DBSchema {
  habits: {
    key: string;
    value: Habit;
  };
  streaks: {
    key: string;
    value: StreakRecord;
  };
  moods: {
    key: string;
    value: MoodRecord;
  };
  appState: {
    key: string;
    value: AppState;
  };
}

class Database {
  private db: IDBPDatabase<RhythmDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<RhythmDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('streaks')) {
          db.createObjectStore('streaks', { keyPath: 'date' });
        }

        if (!db.objectStoreNames.contains('moods')) {
          db.createObjectStore('moods', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('appState')) {
          db.createObjectStore('appState', { keyPath: 'key' });
        }
      },
    });
  }

  async getHabits(): Promise<Habit[]> {
    await this.init();
    const tx = this.db!.transaction('habits', 'readonly');
    const store = tx.objectStore('habits');
    const habits = await store.getAll();
    return habits.sort((a, b) => b.createdAt - a.createdAt);
  }

  async addHabit(habit: Habit): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('habits', 'readwrite');
    await tx.objectStore('habits').put(habit);
    await tx.done;
  }

  async updateHabit(habit: Habit): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('habits', 'readwrite');
    await tx.objectStore('habits').put(habit);
    await tx.done;
  }

  async deleteHabit(id: string): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('habits', 'readwrite');
    await tx.objectStore('habits').delete(id);
    await tx.done;
  }

  async getStreaks(date: string): Promise<StreakRecord | null> {
    await this.init();
    const tx = this.db!.transaction('streaks', 'readonly');
    const store = tx.objectStore('streaks');
    return await store.get(date) ?? null;
  }

  async setStreak(streak: StreakRecord): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('streaks', 'readwrite');
    await tx.objectStore('streaks').put(streak);
    await tx.done;
  }

  async getMoodsByDate(date: string): Promise<MoodRecord[]> {
    await this.init();
    const tx = this.db!.transaction('moods', 'readonly');
    const store = tx.objectStore('moods');
    const moods = await store.getAll() as MoodRecord[];
    return moods.filter(m => m.date === date).sort((a, b) => b.createdAt - a.createdAt);
  }

  async addMood(mood: MoodRecord): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('moods', 'readwrite');
    await tx.objectStore('moods').put(mood);
    await tx.done;
  }

  async updateMood(mood: MoodRecord): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('moods', 'readwrite');
    await tx.objectStore('moods').put(mood);
    await tx.done;
  }

  async deleteMood(id: string): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('moods', 'readwrite');
    await tx.objectStore('moods').delete(id);
    await tx.done;
  }

  async getAppState(): Promise<AppState | null> {
    await this.init();
    const tx = this.db!.transaction('appState', 'readonly');
    const store = tx.objectStore('appState');
    return await store.get('appState') ?? null;
  }

  async saveAppState(state: AppState): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('appState', 'readwrite');
    await tx.objectStore('appState').put({ ...state });
    await tx.done;
  }

  async getCompletedHabitsForDate(date: string): Promise<Habit[]> {
    const streak = await this.getStreaks(date);
    if (!streak?.completed) return [];

    const habits = await this.getHabits();
    return habits;
  }

  async getWeeklyData(days: number): Promise<{
    dates: string[];
    completedCounts: number[];
    moods: (Mood | null)[];
  }> {
    const today = new Date();
    const dates: string[] = [];
    const completedCounts: number[] = [];
    const moods: (Mood | null)[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);

      const streak = await this.getStreaks(dateStr);
      completedCounts.push(streak?.completed ? 1 : 0);

      const moodRecords = await this.getMoodsByDate(dateStr);
      moods.push(moodRecords.length > 0 ? moodRecords[0].mood : null);
    }

    return { dates, completedCounts, moods };
  }
}

export const db = new Database();
