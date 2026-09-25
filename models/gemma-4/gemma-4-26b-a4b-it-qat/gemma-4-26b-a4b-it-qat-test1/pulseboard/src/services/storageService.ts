import { AppState, Activity, DayStatus } from '../types';

const STORAGE_KEY = 'pulseboard_data';
const APP_VERSION = '1.0.0';

export const storageService = {
  save: (state: AppState): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  },

  load: (): AppState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return {
          version: APP_VERSION,
          activities: [],
          dailyStatuses: {},
        };
      }

      const parsed = JSON.parse(saved);
      
      // Basic versioning check
      if (parsed.version !== APP_VERSION) {
        console.warn('Version mismatch. Migration might be needed.');
        // In a real app, implement migration logic here
      }

      return {
        version: APP_VERSION,
        activities: Array.isArray(parsed.activities) ? parsed.activities : [],
        dailyStatuses: typeof parsed.dailyStatuses === 'object' ? parsed.dailyStatuses : {},
      };
    } catch (error) {
      console.error('Failed to load state, returning default:', error);
      return {
        version: APP_VERSION,
        activities: [],
        dailyStatuses: {},
      };
    }
  },

  // Helper to ensure data consistency
  validateState: (state: AppState): AppState => {
    return {
      ...state,
      activities: state.activities.filter(a => a.id && a.name),
      dailyStatuses: Object.fromEntries(
        Object.entries(state.dailyStatuses).map(([date, status]) => [
          date,
          {
            completedActivityIds: Array.isArray(status.completedActivityIds) ? status.completedActivityIds : [],
            completedValues: status.completedValues || {},
          }
        ])
      ),
    };
  }
};
