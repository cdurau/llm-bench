import { useState } from 'react';
import { HABIT_COLORS, HABIT_EMOJIS } from '../lib/colors';
import type { Habit } from '../lib/types';
import type { NewHabitData } from '../hooks/useAppData';
import { IconCheck, IconX } from './icons';

interface HabitComposerProps {
  habit: Habit | null;
  onClose: () => void;
  onSave: (data: NewHabitData) => void;
}

export default function HabitComposer({ habit, onClose, onSave }: HabitComposerProps) {
  const [name, setName] = useState(habit?.name ?? '');
  const [emoji, setEmoji] = useState(habit?.emoji ?? HABIT_EMOJIS[0]);
  const [color, setColor] = useState(habit?.color ?? HABIT_COLORS[0].key);

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    onSave({ name: name.trim(), emoji, color });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-surface p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">{habit ? 'Habit bearbeiten' : 'Habit anlegen'}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <IconX className="h-6 w-6" />
          </button>
        </div>
        <label htmlFor="habit-name" className="mt-6 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
          Name
        </label>
        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. Morgenmeditation"
          autoCapitalize="none"
          className="mt-2 w-full border-0 bg-transparent px-0 py-2 text-[17px] font-medium text-ink outline-none placeholder:text-muted/60"
        />
        <label className="mt-5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
          Emoji
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {HABIT_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              aria-label={`Emoji ${e} wählen`}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                emoji === e ? 'border-accent bg-accent-soft' : 'border-transparent hover:bg-surface-2'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <label className="mt-5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
          Farbe
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {HABIT_COLORS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setColor(c.key)}
              aria-label={`Farbe ${c.key} wählen`}
              aria-pressed={color === c.key}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                color === c.key ? 'scale-110' : 'scale-100'
              }`}
              style={{ backgroundColor: c.deep }}
            >
              {color === c.key ? <IconCheck className="h-4 w-4 text-white" /> : null}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="mt-7 w-full rounded-lg bg-ink py-3.5 text-sm font-medium text-canvas disabled:cursor-not-allowed disabled:opacity-40"
        >
          Speichern
        </button>
      </div>
    </div>
  );
}