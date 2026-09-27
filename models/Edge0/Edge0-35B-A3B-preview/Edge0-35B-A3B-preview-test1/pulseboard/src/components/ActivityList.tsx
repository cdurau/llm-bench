import { useState } from 'react';
import { Activity, ActivityWithStatus } from '../types';
import { ActivityItem } from './ActivityItem';
import { ActivityForm } from './ActivityForm';

export interface ActivityListProps {
  activities: ActivityWithStatus[];
  onToggle: (id: string) => void;
  onEdit: (id: string, name: string, description: string | undefined, category: string, dailyGoal?: number) => void;
  onDelete: (id: string) => void;
  categories: readonly string[];
  onAdd: (name: string, description: string | undefined, category: string, dailyGoal?: number) => void;
  isFuture: boolean;
}

export function ActivityList({
  activities,
  onToggle,
  onEdit,
  onDelete,
  categories,
  onAdd,
  isFuture,
}: ActivityListProps) {
  const [editing, setEditing] = useState<Activity | null>(null);

  const handleCancelEdit = () => setEditing(null);
  const handleEdit = (activity: Activity) => setEditing(activity);
  const handleDelete = (id: string) => {
    if (window.confirm('Aktivität wirklich löschen?')) {
      onDelete(id);
    }
  };
  const handleFormSubmit = (
    name: string,
    description: string | undefined,
    category: string,
    dailyGoal?: number
  ) => {
    if (editing) {
      onEdit(editing.id, name, description, category, dailyGoal);
    } else {
      onAdd(name, description, category, dailyGoal);
    }
    setEditing(null);
  };

  const grouped = activities.reduce<Record<string, ActivityWithStatus[]>>((acc, a) => {
    (acc[a.category] = acc[a.category] || []).push(a);
    return acc;
  }, {});

  if (activities.length === 0 && !editing) {
    return (
      <div className="empty-state">
        <p>Noch keine Aktivitäten vorhanden.</p>
        <p>Füge deine erste Gewohnheit oder Aufgabe hinzu.</p>
      </div>
    );
  }

  if (editing && !isFuture) {
    return (
      <section aria-label="Aktivität bearbeiten">
        <ActivityForm
          onSubmit={handleFormSubmit}
          editing={editing}
          onCancel={handleCancelEdit}
          categories={categories}
        />
      </section>
    );
  }

  return (
    <>
      {!editing && (
        <section aria-label="Neue Aktivität">
          <ActivityForm
            onSubmit={handleFormSubmit}
            categories={categories}
          />
        </section>
      )}

      {isFuture && (
        <p className="future-note">
          ⚠ Zukünftige Tage — Abhaken ist nicht möglich.
        </p>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} aria-label={`Kategorie ${category}`}>
          <h3 className="category-heading">{category}</h3>
          <ul role="list">
            {items.map((a) => (
              <ActivityItem
                key={a.id}
                activity={a}
                onToggle={onToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
