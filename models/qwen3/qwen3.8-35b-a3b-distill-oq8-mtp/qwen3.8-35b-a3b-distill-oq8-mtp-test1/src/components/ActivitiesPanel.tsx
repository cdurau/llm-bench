import type { AppData } from '../types';

interface Props {
  activities: { activity: AppData['activities'][number]; isComplete: boolean }[];
  isFuture: boolean;
  isToday: boolean;
  onToggleComplete: (activityId: string, completed: boolean) => void;
  onDelete: (activityId: string) => void;
}

export function ActivitiesPanel({
  activities,
  isFuture,
  isToday,
  onToggleComplete,
  onDelete,
}: Props) {
  if (activities.length === 0) {
    if (isFuture) {
      return (
        <div className="empty-state">
          <p>Dieser Tag liegt in der Zukunft.</p>
          <p>Hier ist noch nichts zu planen.</p>
        </div>
      );
    }
    return (
      <div className="empty-state">
        <p>Es ist ein ruhiger Tag.</p>
        <p>Füge deine erste Aktivität über den "+"-Button unten hinzu.</p>
      </div>
    );
  }

  return (
    <ul className="activity-list" role="list">
      {activities.map(({ activity, isComplete }) => (
        <li
          key={activity.id}
          className={`activity-item${isComplete ? ' done' : ''}${
            !isToday && !isFuture ? ' past' : ''
          }`}
        >
          <label className="activity-label">
            <input
              type="checkbox"
              checked={isComplete}
              disabled={isFuture}
              onChange={(e) => onToggleComplete(activity.id, e.target.checked)}
              aria-label={`${isComplete ? 'Abhaken' : 'Markieren als erledigt'}: ${activity.name}`}
            />
            <span className="activity-text">
              <span className="activity-name">{activity.name}</span>
              {activity.description && (
                <span className="activity-description">{activity.description}</span>
              )}
              {activity.dailyTarget && (
                <span className="activity-target">
                  Ziel: {activity.dailyTarget}
                </span>
              )}
            </span>
            <button
              className="activity-delete"
              onClick={() => {
                onDelete(activity.id);
              }}
              aria-label={`"${activity.name}" löschen`}
              tabIndex={-1}
            >
              ×
            </button>
          </label>
        </li>
      ))}
    </ul>
  );
}
