// --- Habit editor dialog (add / edit) ---

import { useState } from 'react';
import { HABIT_COLORS, EMOJI_OPTIONS, type Habit } from '../types';
import { IconX } from './Icons';

interface Props {
  open: boolean;
  initial?: Habit | null;
  onSave: (h: Omit<Habit, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export function HabitEditor({ open, initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '⭐');
  const [color, setColor] = useState(initial?.color ?? HABIT_COLORS[0]);

  if (!open) return null;

  const canSave = name.trim().length >= 1 && name.trim().length <= 40;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative w-full sm:max-w-md bg-surface rounded-t-2xl sm:rounded-lg p-6 mx-auto animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-ink">{initial ? 'Habit bearbeiten' : 'Neues Habit'}</h3>
          <button onClick={onCancel} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-alt text-ink-faint" aria-label="Schließen">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <label className="block mb-4">
          <span className="text-xs uppercase tracking-wide text-ink-faint font-medium">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            className="w-full bg-surface-alt border border-border rounded-md px-3 py-2.5 mt-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent outline-none"
            placeholder="z. B. 10 Min. lesen"
            autoFocus
          />
        </label>

        <div className="mb-5">
          <span className="text-xs uppercase tracking-wide text-ink-faint font-medium block mb-2">Emoji</span>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-11 h-11 rounded-lg text-xl flex items-center justify-center transition-colors ${
                  emoji === e ? 'bg-accent-soft ring-2 ring-accent' : 'bg-surface-alt hover:bg-surface'
                }`}
                aria-label={`Emoji ${e} wählen`}
                aria-pressed={emoji === e}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <span className="text-xs uppercase tracking-wide text-ink-faint font-medium block mb-2">Farbe</span>
          <div className="flex gap-3">
            {HABIT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-10 h-10 rounded-lg transition-transform ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-offset-surface ring-ink/20' : ''}`}
                style={{ backgroundColor: c }}
                aria-label={`Farbe wählen`}
                aria-pressed={color === c}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => onSave({ id: initial?.id, name: name.trim(), emoji, color, createdAt: initial?.createdAt ?? Date.now() })}
          disabled={!canSave}
          className="w-full h-12 rounded-lg text-sm font-medium text-white bg-ink disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {initial ? 'Speichern' : 'Habit anlegen'}
        </button>
      </div>
    </div>
  );
}
