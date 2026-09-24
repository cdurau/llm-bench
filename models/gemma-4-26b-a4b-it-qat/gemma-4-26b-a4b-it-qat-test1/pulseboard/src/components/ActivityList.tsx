import React from 'react';
import { Activity } from '../types';
import { ActivityItem } from './ActivityItem';

interface ActivityListProps {
  activities: Activity[];
  dayStatus: any;
  isFutureDay: boolean;
  onToggle: (activityId: string) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  dayStatus,
  isFutureDay,
  onToggle,
  onEdit,
  onDelete,
}) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No activities added yet. Start your journey by adding one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          dayStatus={dayStatus}
          isFutureDay={isFutureDay}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
