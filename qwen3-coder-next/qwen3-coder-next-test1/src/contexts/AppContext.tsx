import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState, Activity, DailyStatus, Theme } from '@/types';
import { useStorageState } from '@/hooks/useStorageState';
import { generateUUID } from '@/utils/uuid';

/* eslint-disable @typescript-eslint/no-unused-vars */
interface AppContextType {
  // State
  appState: AppState;
  
  // Actions
  addActivity: (_activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateActivity: (_id: string, _updates: Partial<Activity>) => void;
  deleteActivity: (_id: string) => void;
  
  toggleActivityStatus: (_activityId: string, _date: string) => void;
  setActivityValue: (_activityId: string, _date: string, _value: number) => void;
  
  changeDate: (_newDate: string) => void;
  goToday: () => void;
  
  theme: Theme;
  toggleTheme: () => void;
  
  // Helpers
  getCompletedCount: (_date?: string) => number;
  getTotalCount: () => number;
  getProgressPercent: (_date?: string) => number;
  getCategoryStats: (_date?: string) => Record<string, { completed: number; total: number }>;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appState, updateAppState] = useStorageState();
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('pulseboard_theme') as Theme;
      return savedTheme || 'light';
    } catch {
      return 'light';
    }
  });

  // Theme persistence
  useEffect(() => {
    localStorage.setItem('pulseboard_theme', theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Theme Toggle
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Aktivität hinzufügen
  const addActivity = (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newActivity: Activity = {
      ...activity,
      id: generateUUID(),
      createdAt: new Date().toISOString()
    };
    
    updateAppState({
      activities: [...appState.activities, newActivity]
    });
  };

  // Aktivität aktualisieren
  const updateActivity = (_id: string, _updates: Partial<Activity>) => {
    updateAppState((prev) => ({
      activities: prev.activities.map(a => 
        a.id === _id ? { ...a, ..._updates, updatedAt: new Date().toISOString() } : a
      )
    }));
  };

  // Aktivität löschen
  const deleteActivity = (_id: string) => {
    updateAppState((prev) => ({
      activities: prev.activities.filter(a => a.id !== _id),
      dailyStatuses: prev.dailyStatuses.filter(s => s.activityId !== _id)
    }));
  };

  // Status einer Aktivität an einem Tag umschalten
  const toggleActivityStatus = (_activityId: string, _date: string) => {
    const existingIndex = appState.dailyStatuses.findIndex(
      s => s.activityId === _activityId && s.date === _date
    );

    if (existingIndex >= 0) {
      // Umkehren
      const newStatus = !appState.dailyStatuses[existingIndex].completed;
      
      updateAppState({
        dailyStatuses: appState.dailyStatuses.map((s, i) => {
          if (i === existingIndex) {
            return {
              ...s,
              completed: newStatus,
              completedAt: newStatus ? new Date().toISOString() : undefined
            };
          }
          return s;
        })
      });
    } else {
      // Hinzufügen
      const newStatus: DailyStatus = {
        activityId: _activityId,
        date: _date,
        completed: true,
        value: 0,
        completedAt: new Date().toISOString()
      };
      
      updateAppState({
        dailyStatuses: [...appState.dailyStatuses, newStatus]
      });
    }
  };

  // Wert einer Aktivität an einem Tag setzen
  const setActivityValue = (_activityId: string, _date: string, _value: number) => {
    const existingIndex = appState.dailyStatuses.findIndex(
      s => s.activityId === _activityId && s.date === _date
    );

    if (existingIndex >= 0) {
      updateAppState({
        dailyStatuses: appState.dailyStatuses.map((s, i) => {
          if (i === existingIndex) {
            return { ...s, value: _value };
          }
          return s;
        })
      });
    } else {
      updateAppState({
        dailyStatuses: [
          ...appState.dailyStatuses,
          { activityId: _activityId, date: _date, completed: _value > 0, value: _value }
        ]
      });
    }
  };

  // Datum ändern
  const changeDate = (_newDate: string) => {
    updateAppState({ currentViewDate: _newDate });
  };

  // Zu heute springen
  const goToday = () => {
    updateAppState({ currentViewDate: new Date().toISOString().split('T')[0] });
  };

  // Hilfsfunktionen
  const getCompletedCount = (_date: string = appState.currentViewDate) => {
    return appState.dailyStatuses.filter(
      s => s.date === _date && s.completed
    ).length;
  };

  const getTotalCount = () => {
    return appState.activities.length;
  };

  const getProgressPercent = (_date: string = appState.currentViewDate) => {
    const totalCount = getTotalCount();
    
    if (totalCount === 0) return 0;
    
    const completedCount = getCompletedCount(_date);
    
    return Math.round((completedCount / totalCount) * 100);
  };

  const getCategoryStats = (date: string = appState.currentViewDate) => {
    const stats: Record<string, { completed: number; total: number }> = {};
    
    appState.activities.forEach(activity => {
      const cat = activity.category || 'Ohne Kategorie';
      
      if (!stats[cat]) {
        stats[cat] = { completed: 0, total: 0 };
      }
      
      stats[cat].total++;
      
      // Prüfen ob für das Datum abgehakt
      const status = appState.dailyStatuses.find(
        s => s.activityId === activity.id && s.date === date
      );
      
      if (status?.completed) {
        stats[cat].completed++;
      }
    });
    
    return stats;
  };

  const value: AppContextType = {
    appState,
    addActivity,
    updateActivity,
    deleteActivity,
    toggleActivityStatus,
    setActivityValue,
    changeDate,
    goToday,
    theme,
    toggleTheme,
    getCompletedCount,
    getTotalCount,
    getProgressPercent,
    getCategoryStats
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
}
