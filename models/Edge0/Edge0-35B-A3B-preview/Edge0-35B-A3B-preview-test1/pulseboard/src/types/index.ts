export interface Activity {
  id: string;
  name: string;
  description?: string;
  category: string;
  dailyGoal?: number;
  createdAt: string;
}

export interface ActivityWithStatus extends Activity {
  doneToday: boolean;
  doneCount: number;
  progressPercent: number;
}

export type DayMap = Record<string, Record<string, boolean>>;

export interface StoredData {
  version: number;
  activities: Activity[];
  dayStatus: DayMap;
  createdAt: string;
  updatedAt: string;
}

export const CURRENT_SCHEMA_VERSION = 1;

export const CATEGORIES = [
  'Gesundheit',
  'Produktivität',
  'Lernen',
  'Soziales',
  'Freizeit',
  'Sonstiges',
] as const;

export type Category = (typeof CATEGORIES)[number];
