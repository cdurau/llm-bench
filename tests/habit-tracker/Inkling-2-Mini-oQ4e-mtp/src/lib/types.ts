export type HabitColorKey =
  | 'terracotta'
  | 'sage'
  | 'ochre'
  | 'dusty'
  | 'plum'
  | 'teal'
  | 'rose'
  | 'sand';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: HabitColorKey;
  createdAt: number;
}

export interface Completion {
  habitId: string;
  date: string; // YYYY-MM-DD (local)
  completedAt: number;
}

export interface MoodEntry {
  date: string; // YYYY-MM-DD (local)
  mood: number; // 1..5
  note: string;
  updatedAt: number;
}

export type ThemePreference = 'system' | 'light' | 'dark';
