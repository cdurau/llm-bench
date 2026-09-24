import React, { useState } from 'react';

interface ActivityItemProps {
  activity: any;
  onEdit: (activity: any) => void;
  onDelete: (id: string) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  editingId: string | null;
  editedName: string;
  setEditedName: (name: string) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ 
  activity,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  editingId,
  editedName,
  setEditedName
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real implementation, this would update the activity's completed status
  };

  const handleSave = () => {
    onSave(activity.id);
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleEdit = () => {
    onEdit(activity);
  };

  const handleDelete = () => {
    onDelete(activity.id);
  };

  return (
    <div className="activity-item-content">
      <div className="activity-checkbox">
        <input 
          type="checkbox" 
          checked={activity.completed || false}
          onChange={handleToggle}
          className="checkbox"
        />
      </div>
      <div className="activity-content">
        {editingId === activity.id ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="edit-input"
            autoFocus
          />
        ) : (
          <div className="activity-text">
            <span className={activity.completed ? "completed" : ""}>
              {activity.name}
            </span>
          </div>
        )}
        {activity.description && (
          <div className="activity-description">
            {activity.description}
          </div>
        )}
      </div>
      <div className="activity-actions">
        {editingId === activity.id ? (
          <button 
            onClick={handleSave}
            className="save-button"
            aria-label="Save changes"
>
            Save
          </button>
        ) : (
          <button 
            onClick={handleEdit}
            className="edit-button"
            aria-label="Edit activity"
>
            Edit
          </button>
        )}
        {editingId === activity.id ? (
          <button 
            onClick={handleCancel}
            className="cancel-button"
            aria-label="Cancel editing"
>
            Cancel
          </button>
        ) : (
          <button 
            onClick={handleDelete}
            className="delete-button"
            aria-label="Delete activity"
>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ActivityItem;