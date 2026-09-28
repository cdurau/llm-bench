import { useState, useRef, FormEvent } from 'react';
import type { Activity, Category } from '../types';
import { CATEGORIES, CATEGORY_LABELS } from '../types';

interface ActivityFormProps {
  activity?: Activity;
  onSubmit: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ActivityForm({ activity, onSubmit, onCancel }: ActivityFormProps) {
  const [name, setName] = useState(activity?.name ?? '');
  const [description, setDescription] = useState(activity?.description ?? '');
  const [category, setCategory] = useState<Category>(activity?.category ?? 'other');
  const [dailyGoal, setDailyGoal] = useState<string>(activity?.dailyGoal?.toString() ?? '');
  
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      dailyGoal: dailyGoal ? parseInt(dailyGoal, 10) : undefined,
    };
    
    onSubmit(activityData);
  };

  return (
    <form onSubmit={handleSubmit} className="activity-form">
      <div className="form-group">
        <label htmlFor="activity-name">Name</label>
        <input
          id="activity-name"
          ref={nameRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Aktivität eingeben"
          required
          autoFocus
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="activity-description">Beschreibung (optional)</label>
        <textarea
          id="activity-description"
          ref={descriptionRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Zusätzliche Details..."
          rows={2}
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="activity-category">Kategorie</label>
          <select
            id="activity-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="activity-goal">Tagesziel (optional)</label>
          <input
            id="activity-goal"
            type="number"
            min="1"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(e.target.value)}
            placeholder="-"
          />
        </div>
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="submit">
          {activity ? 'Speichern' : 'Hinzufügen'}
        </button>
      </div>
    </form>
  );
}