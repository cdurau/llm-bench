export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: number;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string;
  createdAt: number;
}

export interface MoodEntry {
  date: string;
  value: number;
  note: string;
}

export type ThemeMode = 'system' | 'light' | 'dark';

export type TabId = 'heute' | 'woche' | 'einstellungen';