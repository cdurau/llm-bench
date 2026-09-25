import { useState } from 'react';
import { generateId } from '../lib/generateId';
import type { Activity } from '../types';

interface Props {
  categories: string[];
  existingNames: string[];
  onSubmit: (activity: Activity) => void;
  onClose: () => void;
}

export function ActivityForm({ categories, existingNames, onSubmit, onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0] ?? '');
  const [dailyTarget, setDailyTarget] = useState('');
  const [error, setError] = useState('');

  const handleNameInput = (value: string) => {
    setName(value);
    if (value.length > 0 && existingNames.includes(value.trim().toLowerCase())) {
      setError('Ein Eintrag mit diesem Namen existiert bereits.');
    } else {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError('Name darf nicht leer sein.');
      return;
    }
    if (existingNames.includes(trimmed.toLowerCase())) {
      setError('Ein Eintrag mit diesem Namen existiert bereits.');
      return;
    }
    onSubmit({
      id: generateId(),
      name: trimmed,
      description: description.trim() || undefined,
      category,
      dailyTarget: dailyTarget.trim() ? Number(dailyTarget) : undefined,
      createdAt: Date.now(),
    });
    onClose();
  };

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <h2>Aktivität hinzufügen</h2>
      <div className="form-group">
        <label htmlFor="act-name">Name *</label>
        <input
          id="act-name"
          type="text"
          value={name}
          onChange={(e) => handleNameInput(e.target.value)}
          autoFocus
          required
          maxLength={100}
        />
      </div>
      <div className="form-group">
        <label htmlFor="act-desc">Beschreibung</label>
        <textarea
          id="act-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          rows={2}
        />
      </div>
      <div className="form-group">
        <label htmlFor="act-cat">Kategorie</label>
        <select
          id="act-cat"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="act-target">Tagesziel</label>
        <input
          id="act-target"
          type="number"
          min={1}
          value={dailyTarget}
          onChange={(e) => setDailyTarget(e.target.value)}
          placeholder="z. B. 8"
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Abbrechen
        </button>
        <button type="submit" className="btn btn-primary" disabled={error !== ''}>
          Speichern
        </button>
      </div>
    </form>
  );
}
