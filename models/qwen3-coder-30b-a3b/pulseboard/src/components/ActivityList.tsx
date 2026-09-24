import React, { useState } from 'react';
import ActivityItem from './ActivityItem';

interface ActivityListProps {
  activities: any[];
  onToggleActivity: (id: string, date: string) => void;
  onUpdateActivity: (id: string, updates: any) => void;
  onDeleteActivity: (id: string) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ 
  activities, 
  onToggleActivity,
  onUpdateActivity,
  onDeleteActivity 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>('');

  const handleEdit = (activity: any) => {
    setEditingId(activity.id);
    setEditedName(activity.name);
  };

  const handleSave = (id: string) => {
    if (editedName.trim()) {
      onUpdateActivity(id, { name: editedName });
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    onDeleteActivity(id);
  };

  return (
    <div className="activity-list">
      {activities.length === 0 ? (
        <div className="empty-state">
          <p>No activities added yet. Add some activities to get started!</p>
        </div>
      ) : (
        <ul className="activity-list">
          {activities.map(activity => (
            <li key={activity.id} className="activity-item">
              <ActivityItem 
                activity={activity}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSave={handleSave}
                onCancel={handleCancel}
                editingId={editingId}
                editedName={editedName}
                setEditedName={setEditedName}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityList;