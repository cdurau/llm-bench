import { todayKey } from '../lib/date'
import { getCompletedCount, isCompleted } from '../store/createStore'
import type { Activity, StorageData } from '../types'
import { ActivityItem } from './ActivityItem'

interface ActivityListProps {
  activities: Activity[]
  date: string
  data: StorageData
  onToggle: (activityId: string) => void
  onEdit: (activityId: string) => void
  onDelete: (activityId: string) => void
}

/** Liste aller Aktivitäten für den ausgewählten Tag. */
export function ActivityList({
  activities,
  date,
  data,
  onToggle,
  onEdit,
  onDelete,
}: ActivityListProps) {
  if (activities.length === 0) {
    return null
  }

  return (
    <ul className="activity-list">
      {activities.map((activity) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          completedCount={getCompletedCount(data, activity.id, date)}
          isCompleted={isCompleted(data, activity, date)}
          isFuture={date > todayKey()}
          onToggle={() => onToggle(activity.id)}
          onEdit={() => onEdit(activity.id)}
          onDelete={() => onDelete(activity.id)}
        />
      ))}
    </ul>
  )
}
