import type { AppData } from '../types';

const STORAGE_KEY = 'pulseboard_data';
const CURRENT_VERSION = 1;

const DEFAULT_DATA: AppData = {
  version: CURRENT_VERSION,
  activities: [],
  dailyStatus: {},
};

export const storage = {
  save: (data: AppData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage', error);
    }
  },

  load: (): AppData => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return DEFAULT_DATA;

      const parsed = JSON.parse(stored);
      
      if (!parsed || typeof parsed !== 'object') {
        return DEFAULT_DATA;
      }

      // Versioning check
      if (parsed.version !== CURRENT_VERSION) {
        console.warn('Stored data version mismatch. Resetting to default.');
        return DEFAULT_DATA;
      }

      // Basic validation of required fields
      if (!Array.isArray(parsed.activities) || !parsed.dailyStatus) {
        return DEFAULT_DATA;
      }

      return parsed;
    } catch (error) {
      console.error('Failed to load from localStorage, returning defaults', error);
      return DEFAULT_DATA;
    }
  },

  // Helper to get status for a specific date
  getStatusForDate: (date: string): Record<string, boolean> => {
    const data = storage.load();
    return data.dailyStatus[date] || {};
  },

  // Helper to update status for a specific date and activity
  setStatus: (date: string, activityId: string, completed: boolean) => {
    const data = storage.load();
    if (!data.dailyStatus[date]) {
      data.dailyStatus[date] = {};
    }
    data.dailyStatus[date][activityId] = completed;
    storage.save(data);
  },
};
