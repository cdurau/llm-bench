import { useState, useEffect, useCallback } from 'react';

export function useDayProgress(date: string) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('pulseboard_data');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return new Set(data.dayProgress?.[date] ?? []);
      } catch {
        return new Set<string>();
      }
    }
    return new Set<string>();
  });

  useEffect(() => {
    const stored = localStorage.getItem('pulseboard_data');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setCompletedIds(new Set(data.dayProgress?.[date] ?? []));
      } catch {
        setCompletedIds(new Set<string>());
      }
    }
  }, [date]);

  const toggleCompletion = useCallback((activityId: string) => {
    const newSet = new Set(completedIds);
    if (newSet.has(activityId)) {
      newSet.delete(activityId);
    } else {
      newSet.add(activityId);
    }
    setCompletedIds(newSet);
    
    // Lokal speichern
    const stored = localStorage.getItem('pulseboard_data');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (!data.dayProgress) data.dayProgress = {};
        data.dayProgress[date] = Array.from(newSet);
        localStorage.setItem('pulseboard_data', JSON.stringify(data));
      } catch (e) {
        console.error('Fehler beim Speichern:', e);
      }
    }
    
    return newSet;
  }, [completedIds, date]);

  const isCompleted = useCallback((activityId: string) => {
    return completedIds.has(activityId);
  }, [completedIds]);

  return {
    completedIds,
    toggleCompletion,
    isCompleted,
  };
}