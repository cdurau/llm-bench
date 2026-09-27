import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Activity } from '../lib/types';
import {
  draftFromActivity,
  emptyDraft,
  type ActivityDraft,
} from './activity-draft';

interface ActivityDialogProps {
  open: boolean;
  /** `null` = neue Aktivität, sonst wird diese bearbeitet. */
  activity: Activity | null;
  /** Vorhandene Kategorien als Vorschläge (Datalist). */
  categories: string[];
  onClose: () => void;
  onSubmit: (draft: ActivityDraft) => void;
}

/**
 * Add/Edit-Dialog auf nativem <dialog> (showModal): Esc schließt, Backdrop-Klick
 * schließt, Fokus springt ins Name-Feld. Validierung mit konkreten Fehlermeldungen.
 */
export function ActivityDialog({
  open,
  activity,
  categories,
  onClose,
  onSubmit,
}: ActivityDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<ActivityDraft>(emptyDraft);
  const [error, setError] = useState('');

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      setDraft(activity ? draftFromActivity(activity) : emptyDraft());
      setError('');
      el.showModal();
      // Fokus nach dem Öffnen setzen (Browserspezifisch, daher entschärft).
      window.setTimeout(() => nameRef.current?.focus(), 0);
    } else if (!open && el.open) {
      el.close();
    }
  }, [open, activity]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draft.name.trim();
    if (name === '') {
      setError('Gib der Aktivität einen Namen.');
      nameRef.current?.focus();
      return;
    }
    const target = draft.target === null ? 1 : draft.target;
    if (!Number.isInteger(target) || target < 1 || target > 999) {
      setError('Das Tagesziel muss eine ganze Zahl zwischen 1 und 999 sein.');
      return;
    }
    onSubmit({
      name: name.slice(0, 80),
      description: draft.description.trim().slice(0, 200),
      category: draft.category.trim().slice(0, 40),
      target,
    });
  }

  const targetValue = draft.target === null ? '' : String(draft.target);

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="dialog-title"
      onClose={onClose}
    >
      <h2 id="dialog-title" className="dialog__title">
        {activity ? 'Aktivität bearbeiten' : 'Neue Aktivität'}
      </h2>
      <form className="dialog__form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="pf-name">Name</label>
          <input
            id="pf-name"
            ref={nameRef}
            type="text"
            maxLength={80}
            value={draft.name}
            autoComplete="off"
            placeholder="z. B. Morgens laufen"
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
        </div>

        <div className="field">
          <label htmlFor="pf-desc">Beschreibung</label>
          <textarea
            id="pf-desc"
            rows={2}
            maxLength={200}
            value={draft.description}
            placeholder="optional"
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          />
        </div>

        <div className="dialog__grid">
          <div className="field">
            <label htmlFor="pf-cat">Kategorie</label>
            <input
              id="pf-cat"
              type="text"
              list="kategorie-vorschlaege"
              maxLength={40}
              value={draft.category}
              autoComplete="off"
              placeholder="z. B. Gesundheit"
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            />
            <datalist id="kategorie-vorschlaege">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="field">
            <label htmlFor="pf-target">Tagesziel</label>
            <input
              id="pf-target"
              type="number"
              min={1}
              max={999}
              step={1}
              value={targetValue}
              placeholder="1"
              onChange={(e) => {
                const value = e.target.value;
                setDraft((d) => ({
                  ...d,
                  target: value === '' ? null : Number(value),
                }));
              }}
            />
            <p className="field__hint">Leer lassen: einmal pro Tag abhaken.</p>
          </div>
        </div>

        {error !== '' && (
          <p className="dialog__error" role="alert">
            {error}
          </p>
        )}

        <div className="dialog__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="btn btn--primary">
            Speichern
          </button>
        </div>
      </form>
    </dialog>
  );
}
