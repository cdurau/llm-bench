import { useState, useEffect, useCallback } from 'react';
import type { Activity } from '../types';
import * as storage from '../utils/storage';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = storage.loadData();
    setActivities(data.activities);
    setLoading(false);
  }, []);

  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newActivity = storage.addActivity(activity);
    setActivities(prev => [...prev, newActivity]);
    return newActivity;
  }, []);

  const updateActivity = useCallback((id: string, updates: Partial<Omit<Activity, 'id' | 'createdAt'>>) => {
    const updated = storage.updateActivity(id, updates);
    if (updated) {
      setActivities(prev => prev.map(a => a.id === id ? updated : a));
    }
    return updated;
  }, []);

  const deleteActivity = useCallback((id: string) => {
    const success = storage.deleteActivity(id);
    if (success) {
      setActivities(prev => prev.filter(a => a.id !== id));
    }
    return success;
  }, []);

  return {
    activities,
    loading,
    addActivity,
    updateActivity,
    deleteActivity,
  };
}