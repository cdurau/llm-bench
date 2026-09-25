import type { Activity } from '../types';
import type { AppData } from '../types';
import { generateId } from '../lib/generateId';

export interface UseActivitiesInput {
  activities: Activity[];
  onUpdate: (data: AppData) => void;
}

export function useActivities({ activities, onUpdate }: UseActivitiesInput) {
  const addActivity = (activity: Omit<Activity, 'id' | 'createdAt'>): void => {
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      createdAt: Date.now(),
    };
    onUpdate({
      version: 1,
      activities: [...activities, newActivity],
      completions: [],
    });
  };

  const updateActivity = (id: string, updates: Partial<Activity>): void => {
    onUpdate({
      version: 1,
      activities: activities.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
      completions: [],
    });
  };

  const deleteActivity = (id: string): void => {
    onUpdate({
      version: 1,
      activities: activities.filter((a) => a.id !== id),
      completions: [],
    });
  };

  return { addActivity, updateActivity, deleteActivity };
}
