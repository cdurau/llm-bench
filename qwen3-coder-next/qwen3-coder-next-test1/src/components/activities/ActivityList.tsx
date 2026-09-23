import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { ActivityItem } from './ActivityItem';

export function ActivityList() {
  const { appState } = useApp();
  
  // Filtere Aktivitäten für den aktuellen Tag
  const activities = useMemo(() => {
    return appState.activities.map(activity => ({
      ...activity,
      // Füge den aktuellen Status für den Tag hinzu
    }));
  }, [appState.activities]);
  
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="mb-4 p-4 bg-gray-100 dark:bg-slate-700 rounded-full">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Noch keine Aktivitäten
        </h3>
        
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Füge deine ersten Aktivitäten hinzu, um deinen Tagesablauf zu strukturieren.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <ActivityItem 
          key={activity.id} 
          activity={activity}
          date={appState.currentViewDate}
        />
      ))}
    </div>
  );
}
