// --- Mood selector (1–5) plus optional note ---

import { useState } from 'react';
import type { MoodEmoji } from '../types';

interface Props {
  value: number;
  onChange: (value: number) => void;
  note: string;
  onNoteChange: (n: string) => void;
}

const LABELS: Record<number, string> = {
  1: 'Sehr schlecht',
  2: 'Schlecht',
  3: 'Neutral',
  4: 'Gut',
  5: 'Sehr gut',
};

export function MoodPicker({ value, onChange, note, onNoteChange }: Props) {
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  return (
    <div className="bg-surface rounded-lg border border-border p-5 shadow-card animate-fade-in">
      <p className="text-xs uppercase tracking-wide text-ink-faint font-medium mb-4">Wie fühlst du dich heute?</p>
      <div className="flex justify-between gap-2 mb-2">
        {([1, 2, 3, 4, 5] as number[]).map((n) => {
          const emoji = (['😣', '😕', '😐', '🙂', '😄'] as MoodEmoji[])[n - 1];
          const selected = value === n;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              onMouseEnter={() => setFocusedIdx(n)}
              onMouseLeave={() => setFocusedIdx(null)}
              className={`flex flex-col items-center gap-1.5 flex-1 min-h-[72px] rounded-lg transition-colors ${
                selected ? 'bg-accent-soft' : 'hover:bg-surface-alt'
              }`}
              aria-label={`Stimmung ${n}: ${LABELS[n]}`}
              aria-pressed={selected}
            >
              <span
                className="text-3xl transition-transform"
                style={{ transform: focusedIdx === n ? 'scale(1.15)' : undefined }}
                aria-hidden="true"
              >
                {emoji}
              </span>
              <span className={`text-xs font-medium tabular-nums ${selected ? 'text-accent-text' : 'text-ink-faint'}`}>
                {n}
              </span>
            </button>
          );
        })}
      </div>
      {value > 0 && (
        <p className="text-xs text-ink-muted mb-3 -mt-1" aria-live="polite">{LABELS[value]}</p>
      )}
      <textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Optionale Kurznotiz …"
        maxLength={500}
        rows={2}
        className="w-full bg-surface-alt border border-border rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint resize-none focus:border-accent"
      />
    </div>
  );
}
