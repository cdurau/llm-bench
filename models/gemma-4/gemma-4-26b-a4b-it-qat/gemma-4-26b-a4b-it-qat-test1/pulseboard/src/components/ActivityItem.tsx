import React from 'react';
import { Check, Trash2, Edit2, Plus } from 'lucide-react';
import { Activity, DayStatus } from '../types';
import { cn } from '../utils/helpers';

interface ActivityItemProps {
  activity: Activity;
  dayStatus: DayStatus;
  isFutureDay: boolean;
  onToggle: (activityId: string) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  dayStatus,
  isFutureDay,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const isCompleted = dayStatus.completedActivityIds.includes(activity.id);

  return (
    <div
      className={cn(
        "group flex items-center justify-between p-4 mb-3 bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200",
        isCompleted 
          ? "border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10" 
          : "border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-sm"
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <button
          disabled={isFutureDay}
          onClick={() => onToggle(activity.id)}
          className={cn(
            "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors",
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-gray-300 dark:border-gray-600 group-hover:border-indigo-400",
            isFutureDay && "opacity-50 cursor-not-allowed"
          )}
          aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
        >
          {isCompleted && <Check className="w-4 h-4" strokeWidth={3} />}
        </button>

        <div className="flex flex-col">
          <span
            className={cn(
              "font-semibold transition-all",
              isCompleted ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-700 dark:text-gray-200"
            )}
          >
            {activity.name}
          </span>
          {activity.description && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {activity.description}
            </span>
          )}
          <span className="text-xs font-medium text-indigo-500 uppercase tracking-tight">
            {activity.category}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(activity)}
          className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"
          title="Bearbeiten"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(activity.id)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Löschen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
