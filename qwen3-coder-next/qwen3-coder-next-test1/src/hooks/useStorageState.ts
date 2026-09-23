import { useState, useEffect, useCallback } from 'react';
import { AppState, Activity } from '@/types';
import { loadAppState, saveAppState, getInitialAppState } from '@/utils/storage';

/**
 * Hook für state management mit persistence
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function useStorageState(initialValue?: AppState): [AppState, (_partial: Partial<AppState> | ((_prev: AppState) => Partial<AppState>)) => void] {
  const [appState, setAppState] = useState<AppState>(() => {
    if (initialValue) {
      return initialValue;
    }
    
    try {
      return loadAppState();
    } catch {
      return getInitialAppState();
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateState = useCallback((partial: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) => {
    setAppState((prev) => {
      const stateUpdate = typeof partial === 'function' ? partial(prev) : partial;
      const newState = { ...prev, ...stateUpdate };
      try {
        saveAppState(newState);
      } catch {
        // Error logged in saveAppState
      }
      return newState;
    });
  }, []);

  // Sync bei Änderungen
  useEffect(() => {
    try {
      saveAppState(appState);
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }, [appState]);

  return [appState, updateState];
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Hook für eine einzelne Aktivität mit persistence
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function useStorageActivity(activityId: string | null): [Activity | undefined, (_partialUpdates: Partial<Activity>) => void] {
  const [appState, updateAppState] = useStorageState();
  
  const activity = appState.activities.find(a => a.id === activityId);
  
  const updateActivity = useCallback((_updates: Partial<Activity>) => {
    if (!activityId) return;
    
    updateAppState({
      activities: appState.activities.map((a) => {
        if (a.id === activityId) {
          return { ...a, ..._updates };
        }
        return a;
      })
    });
  }, [activityId, appState.activities, updateAppState]);
  
  return [activity, updateActivity];
}
/* eslint-enable @typescript-eslint/no-unused-vars */
