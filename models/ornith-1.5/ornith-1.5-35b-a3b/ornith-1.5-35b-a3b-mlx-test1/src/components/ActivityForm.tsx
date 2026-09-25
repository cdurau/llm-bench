import { useEffect, useRef, useState } from 'react';
import type { Activity } from '@/lib/types';

interface Props {
  /** Leer = neue Aktivität, gesetzt = Bearbeitung. */
  activity?: Activity;
  onSubmit: (input: Omit<Activity, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

/**
 * Add/Edit-Modal: Name (Pflicht), Beschreibung, Kategorie, Tagesziel.
 * Schließt sich über Escape oder Klick auf den Backdrop.
 */
export function ActivityForm({ activity, onSubmit, onClose }: Props) {
  const [name, setName] = useState(activity?.name ?? '');
  const [description, setDescription] = useState(activity?.description ?? '');
  const [category, setCategory] = useState(activity?.category ?? 'Ohne Kategorie');
  const [dailyGoal, setDailyGoal] = useState(activity?.dailyGoal ?? 0);

  const nameRef = useRef<HTMLInputElement>(null);

  // Name-Feld beim Öffnen fokussieren (Tastatur-UX).
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // Escape schließt das Modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      category: category.trim() || 'Ohne Kategorie',
      dailyGoal: Math.max(0, Math.trunc(dailyGoal || 0)),
    });
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdrop}>
      <form className="modal" onSubmit={handleSubmit}>
        <h3>{activity ? 'Aktivität bearbeiten' : 'Neue Aktivität'}</h3>

        <div className="add-form">
          <div className="field">
            <label htmlFor="af-name">Name</label>
            <input
              id="af-name"
              ref={nameRef}
              value={name}
              required
              placeholder="z. B. 30 Minuten Sport"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="af-desc">Beschreibung (optional)</label>
            <textarea
              id="af-desc"
              value={description}
              placeholder="Was, wann, wo?"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="row">
            <div className="field">
              <label htmlFor="af-category">Kategorie</label>
              <input
                id="af-category"
                value={category}
                placeholder="Ohne Kategorie"
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="af-goal">Tagesziel</label>
              <input
                id="af-goal"
                type="number"
                min={0}
                step={1}
                value={dailyGoal}
                placeholder="0 = kein Ziel"
                onChange={(e) => setDailyGoal(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Abbrechen
            </button>
            <button type="submit" className="btn btn-primary">
              {activity ? 'Speichern' : 'Hinzufügen'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
