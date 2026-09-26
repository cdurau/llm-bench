import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppData, Activity } from '../types';
import { storage } from '../lib/storage';
import { format, addDays, subDays, parseISO } from 'date-fns';

interface PulseContextType {
  currentDate: Date;
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  setCurrentDate: (date: Date) => void;
  toggleActivity: (activityId: string, completed: boolean) => void;
  isActivityCompleted: (activityId: string) => boolean;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  updateActivity: (id: string, activity: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
}

const PulseContext = createContext<PulseContextType | undefined>(undefined);

export const PulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const data = storage.load();
    setActivities(data.activities);
  }, []);

  const toggleActivity = (activityId: string, completed: boolean) => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    storage.setStatus(dateStr, activityId, completed);
    // Trigger re-render by updating a state or using a force-update pattern
    // Since isActivityCompleted reads from storage, we need a way to notify React
    setActivities([...activities]); 
  };

  const isActivityCompleted = (activityId: string) => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    return storage.getStatusForDate(dateStr)[activityId] || false;
  };

  const addActivity = (activityData: Omit<Activity, 'id' | 'createdAt'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const updated = [...activities, newActivity];
    setActivities(updated);
    
    const data = storage.load();
    storage.save({ ...data, activities: updated });
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    const updated = activities.map(a => a.id === id ? { ...a, ...updates } : a);
    setActivities(updated);
    
    const data = storage.load();
    storage.save({ ...data, activities: updated });
  };

  const deleteActivity = (id: string) => {
    const updated = activities.filter(a => a.id !== id);
    setActivities(updated);
    
    const data = storage.load();
    storage.save({ ...data, activities: updated });
  };

  return (
    <PulseContext.Provider value={{ 
      currentDate, 
      setCurrentDate, 
      activities, 
      setActivities, 
      toggleActivity, 
      isActivityCompleted, 
      addActivity, 
      updateActivity, 
      deleteActivity 
    }}>
      {children}
    </PulseContext.Provider>
  );
};

export const usePulse = () => {
  const context = useContext(PulseContext);
  if (!context) throw new Error('usePulse must be used within a PulseProvider');
  return context;
};
