export interface Activity {
  id: string;
  name: string;
  description?: string;
  category: string;
  dailyTarget?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface DailyStatus {
  activityId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  value?: number; // aktueller Wert für Ziele
  completedAt?: string; // ISO timestamp when completed
}

export interface AppState {
  activities: Activity[];
  dailyStatuses: DailyStatus[];
  currentViewDate: string; // YYYY-MM-DD
}

export interface VersionedData {
  version: number;
  data: AppState;
}

export const VERSIONED_DATA_VERSION = 1;

// Storage keys
export const STORAGE_KEY = 'pulseboard_data_v1';
export const THEME_STORAGE_KEY = 'pulseboard_theme';

// Storage helpers
export interface StorageError {
  type: 'corrupted' | 'invalid_version' | 'parse_error';
  message: string;
}

export type Theme = 'light' | 'dark';
