import { useState } from 'react';
import type { ChangeEvent } from 'react';

/** @jsxImportSource react */
import { useApp } from '@/contexts/AppContext';
import { Activity } from '@/types';

interface ActivityItemProps {
  activity: Activity;
  date: string;
}

export function ActivityItem({ activity, date }: ActivityItemProps) {
  const { toggleActivityStatus, setActivityValue } = useApp();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(activity.name);
  const [editDescription, setEditDescription] = useState(activity.description || '');
  
  // Finde den Status für dieses Datum aus dem Context
  const { appState } = useApp();
  const dailyStatus = appState.dailyStatuses.find(s => s.activityId === activity.id && s.date === date);
  
  // Prüfe ob der Tag in der Zukunft liegt
  const isFuture = new Date(date + 'T00:00:00') > new Date(new Date().toISOString().split('T')[0] + 'T00:00:00');
  
  const handleClick = () => {
    if (!isFuture) {
      toggleActivityStatus(activity.id, date);
    }
  };
  
  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isFuture) {
      const value = parseFloat(e.target.value);
      setActivityValue(activity.id, date, isNaN(value) ? 0 : value);
    }
  };
  
  const isCompleted = dailyStatus?.completed || false;
  
  return (
    <div className={`group relative p-4 rounded-lg border transition-all duration-200 mb-3
      ${isCompleted 
        ? 'bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
      }
    `}>
      <div className="flex items-start gap-3">
        {!isFuture && (
          <button
            onClick={handleClick}
            className={`mt-1 flex-shrink-0 w-5 h-5 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isCompleted 
                ? 'bg-green-600 border-green-600 focus:ring-green-500' 
                : 'border-gray-300 dark:border-slate-600 hover:border-blue-500 focus:ring-blue-500'
              }
            `}
          >
            {isCompleted && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-2 py-1 text-base font-medium bg-transparent border-b border-blue-500 focus:outline-none"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-2 py-1 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:outline-none"
                rows={2}
              />
            </div>
          ) : (
            <>
              <h4 className={`font-medium text-base ${isCompleted ? 'text-green-800 dark:text-green-300 line-through' : 'text-gray-900 dark:text-white'}`}>
                {activity.name}
              </h4>
              
              {activity.description && (
                <p className={`text-sm mt-1 ${isCompleted ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {activity.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                {activity.category && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {activity.category}
                  </span>
                )}
                
                {activity.dailyTarget !== undefined && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={dailyStatus?.value ?? 0}
                      onChange={handleValueChange}
                      disabled={isFuture}
                      className={`w-16 px-2 py-0.5 rounded border text-sm
                        ${isFuture 
                          ? 'border-gray-200 dark:border-slate-700 bg-transparent text-gray-400' 
                          : 'border-gray-300 dark:border-slate-600 focus:ring-blue-500'
                        }
                      `}
                    />
                    <span className="text-xs text-gray-400">/ {activity.dailyTarget}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {!isEditing && (
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-500"
            onClick={() => setIsEditing(!isEditing)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-3.536a1.998 1.998 0 012.828 0L16.5 16.5M3 4l1.272-1.272a1.998 1.998 0 012.828 0L9.364 7.07m-5.192 5.192l3.536 3.536m-2.036-3.536a1.998 1.998 0 012.828 0L16.5 16.5m0 0l4.243 4.243L16.5 16.5m0 0l4.242-4.243C18.556 11.79 18.828 10.435 18.667 9.076l-1.732-3c-.543-.943-1.685-1.247-2.584-.739l-5.24 2.62C10.38 7.97 9.54 8.62 8.946 9.513l-3.536 3.536m0-7.072l3.536 3.536" />
            </svg>
          </button>
        )}
      </div>
      
      {isFuture && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Zukunft - noch nicht erreichbar
          </p>
        </div>
      )}
    </div>
  );
}
