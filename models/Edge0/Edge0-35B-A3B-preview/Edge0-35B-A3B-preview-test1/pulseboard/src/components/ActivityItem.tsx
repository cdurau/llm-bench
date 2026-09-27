import { Activity, ActivityWithStatus } from '../types';

export interface ActivityItemProps {
  activity: ActivityWithStatus;
  onToggle: (id: string) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

export function ActivityItem({ activity, onToggle, onEdit, onDelete }: ActivityItemProps) {
  const handleToggle = () => {
    if (activity.dailyGoal && activity.doneCount < activity.dailyGoal) {
      // For activities with a goal, toggling increments one count
      onToggle(activity.id);
    } else {
      onToggle(activity.id);
    }
  };

  return (
    <li className="activity-item" role="listitem">
      <div className="activity-main">
        <input
          type="checkbox"
          id={`toggle-${activity.id}`}
          checked={activity.doneToday}
          onChange={handleToggle}
          aria-label={`${activity.name} ${activity.doneToday ? '— erledigt' : '— offen'}`}
          className="activity-checkbox"
          disabled={false}
        />
        <label htmlFor={`toggle-${activity.id}`} className="activity-label">
          <span className={`activity-name ${activity.doneToday ? 'done' : ''}`}>
            {activity.name}
          </span>
          {activity.description && (
            <span className="activity-desc">{activity.description}</span>
          )}
        </label>
      </div>

      <div className="activity-meta">
        <span className="activity-category" aria-label={`Kategorie: ${activity.category}`}>
          {activity.category}
        </span>
        {activity.dailyGoal && (
          <span className="activity-goal" aria-label={`Tagesziel: ${activity.dailyGoal}`}>
            {activity.doneCount}/{activity.dailyGoal}
          </span>
        )}
        <span className="activity-progress">
          {activity.progressPercent}%
        </span>
      </div>

      <div className="activity-actions">
        <button
          type="button"
          onClick={() => onEdit(activity)}
          aria-label={`${activity.name} bearbeiten`}
          className="btn-icon"
          title="Bearbeiten"
        >
          ✎
        </button>
        <button
          type="button"
          onClick={() => onDelete(activity.id)}
          aria-label={`${activity.name} löschen`}
          className="btn-icon"
          title="Löschen"
        >
          ✕
        </button>
      </div>
    </li>
  );
}
