import { useState, useEffect, FormEvent } from 'react';
import { Activity } from '../types';

export interface ActivityFormProps {
  onSubmit: (name: string, description: string | undefined, category: string, dailyGoal?: number) => void;
  editing?: Activity | null;
  onCancel?: () => void;
  categories: readonly string[];
}

export function ActivityForm({ onSubmit, editing, onCancel, categories }: ActivityFormProps) {
  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [category, setCategory] = useState(editing?.category ?? (categories[0] ?? 'Sonstiges'));
  const [dailyGoalStr, setDailyGoalStr] = useState(editing?.dailyGoal?.toString() ?? '');
  const [error, setError] = useState('');

  // Sync form state when editing prop changes (entering edit mode)
  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setDescription(editing.description ?? '');
      setCategory(editing.category);
      setDailyGoalStr(editing.dailyGoal?.toString() ?? '');
      setError('');
    }
  }, [editing]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Bitte einen Namen eingeben');
      return;
    }

    const dailyGoal = dailyGoalStr.trim()
      ? parseInt(dailyGoalStr, 10)
      : undefined;

    if (dailyGoal && (isNaN(dailyGoal) || dailyGoal <= 0)) {
      setError('Tagesziel muss eine positive Zahl sein');
      return;
    }

    onSubmit(name.trim(), description?.trim() || undefined, category, dailyGoal);

    if (!editing) {
      setName('');
      setDescription('');
      setDailyGoalStr('');
    }
  };

  const handleCancel = () => {
    if (editing) {
      setName(editing.name);
      setDescription(editing.description ?? '');
      setCategory(editing.category);
      setDailyGoalStr(editing.dailyGoal?.toString() ?? '');
    } else {
      setName('');
      setDescription('');
      setDailyGoalStr('');
    }
    setError('');
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="activity-form" aria-label={editing ? 'Aktivität bearbeiten' : 'Neue Aktivität'} noValidate>
      <div className="form-group">
        <label htmlFor="activity-name">Name *</label>
        <input
          id="activity-name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
          placeholder="z.B. Morgens joggen"
          data-testid="name-input"
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label htmlFor="activity-desc">Beschreibung</label>
        <input
          id="activity-desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional — für Details"
          maxLength={200}
        />
      </div>

      <div className="form-group">
        <label htmlFor="activity-category">Kategorie</label>
        <select
          id="activity-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="activity-goal">Tagesziel (optional)</label>
        <input
          id="activity-goal"
          type="number"
          value={dailyGoalStr}
          onChange={(e) => setDailyGoalStr(e.target.value)}
          placeholder="z.B. 3"
          min="1"
          aria-describedby={dailyGoalStr ? 'goal-help' : undefined}
        />
        <span id="goal-help" className="form-hint">Leer lassen für einmal pro Tag</span>
      </div>

      {error ? (
        <p className="form-error" role="alert">{error}</p>
      ) : null}

      <div className="form-actions">
        <button type="submit" aria-label={editing ? 'Speichern' : 'Hinzufügen'}>
          {editing ? 'Speichern' : 'Hinzufügen'}
        </button>
        {editing && (
          <button type="button" onClick={handleCancel} className="btn-secondary">
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}
