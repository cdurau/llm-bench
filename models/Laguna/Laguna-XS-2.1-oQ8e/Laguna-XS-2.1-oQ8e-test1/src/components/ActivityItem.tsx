import { useState } from 'react';
import type { Activity } from '../types';

interface ActivityItemProps {
  activity: Activity;
  isCompleted: boolean;
  onToggle: (id: string) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

export function ActivityItem({ 
  activity, 
  isCompleted, 
  onToggle, 
  onEdit, 
  onDelete 
}: ActivityItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Möchten Sie "${activity.name}" wirklich löschen?`)) {
      setIsDeleting(true);
      onDelete(activity.id);
    }
  };

  return (
    <div 
      className={`activity-item ${isCompleted ? 'completed' : ''}`}
      role="listitem"
      aria-label={`${activity.name}, ${isCompleted ? 'erledigt' : 'offen'}`}
    >
      <div className="activity-content">
        <button
          type="button"
          className="checkbox-btn"
          aria-checked={isCompleted}
          onClick={() => onToggle(activity.id)}
          title={isCompleted ? 'Als offen markieren' : 'Als erledigt markieren'}
        >
          <span className="checkbox" aria-hidden="true">
            {isCompleted ? '✓' : '○'}
          </span>
        </button>
        
        <div className="activity-details">
          <h3 className="activity-name">{activity.name}</h3>
          {activity.description && (
            <p className="activity-description">{activity.description}</p>
          )}
          {activity.dailyGoal && (
            <div className="activity-goal">
              Tagesziel: {activity.dailyGoal}
            </div>
          )}
        </div>
      </div>
      
      <div className="activity-actions">
        <button
          type="button"
          onClick={() => onEdit(activity)}
          aria-label="Bearbeiten"
          title="Bearbeiten"
        >
          ✏️
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Löschen"
          title="Löschen"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}