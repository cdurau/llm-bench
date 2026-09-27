import type { Activity, AppData, DayKey } from '../lib/types';
import { countFor, isDone } from '../state/store';
import { isFuture } from '../lib/dates';
import { ActivityRow } from './ActivityRow';
import { EmptyState } from './EmptyState';

interface ActivityListProps {
  data: AppData;
  day: DayKey;
  onToggle: (activity: Activity) => void;
  onDecrement: (activity: Activity) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onAdd: () => void;
}

/** Die Tagesliste mit Empty-State. */
export function ActivityList({
  data,
  day,
  onToggle,
  onDecrement,
  onEdit,
  onDelete,
  onAdd,
}: ActivityListProps) {
  const future = isFuture(day);

  if (data.activities.length === 0) {
    return (
      <section aria-label="Aktivitäten">
        <h2 className="section__label">Aktivitäten</h2>
        <EmptyState onAdd={onAdd} />
      </section>
    );
  }

  return (
    <section aria-label="Aktivitäten">
      <h2 className="section__label">Aktivitäten</h2>
      <ul className="list">
        {data.activities.map((activity) => (
          <ActivityRow
            key={activity.id}
            activity={activity}
            count={countFor(data, day, activity)}
            done={isDone(data, day, activity)}
            future={future}
            onToggle={() => onToggle(activity)}
            onDecrement={() => onDecrement(activity)}
            onEdit={() => onEdit(activity)}
            onDelete={() => onDelete(activity)}
          />
        ))}
      </ul>
    </section>
  );
}
