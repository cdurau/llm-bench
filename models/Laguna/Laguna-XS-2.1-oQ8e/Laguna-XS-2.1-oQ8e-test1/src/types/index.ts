// Datenstruktur-Version für Persistenz
export const DATA_VERSION = 1;

export interface Activity {
  id: string;
  name: string;
  description?: string;
  category: string;
  dailyGoal?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DayProgress {
  date: string; // YYYY-MM-DD Format
  completedActivityIds: Set<string>;
}

export interface StoredData {
  version: number;
  activities: Activity[];
  dayProgress: Record<string, string[]>; // date -> array of activity IDs
}

export type Category = 'work' | 'health' | 'learning' | 'personal' | 'other';

export const CATEGORIES: Category[] = ['work', 'health', 'learning', 'personal', 'other'];

export const CATEGORY_LABELS: Record<Category, string> = {
  work: 'Arbeit',
  health: 'Gesundheit',
  learning: 'Lernen',
  personal: 'Persönlich',
  other: 'Sonstiges',
};