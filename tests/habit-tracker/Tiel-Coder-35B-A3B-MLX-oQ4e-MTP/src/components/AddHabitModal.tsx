import { useEffect, useRef, useState } from 'react';
import { HABIT_COLORS, HABIT_EMOJIS, type NewHabit } from '../lib/habits.ts';

export function AddHabitModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: NewHabit;
  onClose: () => void;
  onSave: (h: NewHabit) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? HABIT_EMOJIS[0]);
  const [color, setColor] = useState(initial?.color ?? HABIT_COLORS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setEmoji(initial?.emoji ?? HABIT_EMOJIS[0]);
      setColor(initial?.color ?? HABIT_COLORS[0]);
      const t = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(t);
    }
  }, [open, initial]);

  if (!open) return null;

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ name: trimmed, emoji, color });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Habit anlegen"
    >
      <div
        className="w-full max-w-[360px] rounded-t-3xl border-b bg-[var(--surface)] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[var(--edge)]" aria-hidden="true" />
        <h3 className="text-lg font-medium tracking-tight">Neues Habit</h3>

        <input
          ref={inputRef}
          data-testid="habit-name"
          value={name}
          placeholder="z. B. Wasser trinken"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
          }}
          className="mt-3 w-full rounded-xl border bg-[var(--surface-2)] px-3 py-3 text-sm outline-none focus:border-[var(--accent-strong)]"
          style={{ borderColor: 'var(--edge)' }}
          autoComplete="off"
        />

        <p className="mt-4 text-sm text-[var(--ink-muted)]">Symbol</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {HABIT_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              aria-pressed={emoji === e}
              aria-label={`Symbol ${e}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-colors"
              style={{
                borderColor: emoji === e ? color : 'var(--edge)',
                backgroundColor: emoji === e ? 'var(--surface-2)' : 'transparent',
              }}
            >
              {e}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-[var(--ink-muted)]">Farbe</p>
        <div className="mt-2 flex gap-3">
          {HABIT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Farbe ${c}`}
              aria-pressed={color === c}
              className="h-8 w-8 rounded-full transition-transform"
              style={{
                backgroundColor: c,
                outline: color === c ? `2px solid ${c}` : '2px solid transparent',
                outlineOffset: '2px',
                transform: color === c ? 'scale(1.1)' : undefined,
              }}
            />
          ))}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors hover:bg-[var(--surface-2)]"
            style={{ borderColor: 'var(--edge)' }}
          >
            Abbrechen
          </button>
          <button
            data-testid="habit-save"
            onClick={save}
            disabled={!name.trim()}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-medium text-white transition-colors disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent-strong)' }}
          >
            Anlegen
          </button>
        </div>
      </div>
    </div>
  );
}
