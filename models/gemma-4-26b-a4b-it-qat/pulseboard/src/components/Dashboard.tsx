import React from 'react';
import { CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import { AppState } from '../types';

interface DashboardProps {
  state: AppState;
  currentDate: Date;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, currentDate }) => {
  const todayKey = currentDate.toISOString().split('T')[0];
  const dailyStatus = state.dailyStatuses[todayKey] || {
    completedActivityIds: [],
    completedValues: {},
  };

  const totalActivities = state.activities.length;
  const completedCount = dailyStatus.completedActivityIds.length;
  const remainingCount = totalActivities - completedCount;
  const progressPercent = totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
          <Circle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Offen</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{remainingCount}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Erledigt</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedCount}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Fortschritt</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{progressPercent}%</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-500" 
              style={{ width:  }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
