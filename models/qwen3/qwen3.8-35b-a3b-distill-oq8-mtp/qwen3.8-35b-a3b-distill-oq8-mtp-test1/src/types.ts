export interface Activity {
  id: string;
  name: string;
  description?: string;
  category: string;
  dailyTarget?: number;
  createdAt: number;
}

export interface CompletionRecord {
  date: string; // ISO date YYYY-MM-DD
  completions: Record<string, boolean>; // { activityId: boolean }
}

export interface AppData {
  version: number;
  activities: Activity[];
  completions: CompletionRecord[];
}

export type Tab = 'aktivitäten' | 'dashboard';
