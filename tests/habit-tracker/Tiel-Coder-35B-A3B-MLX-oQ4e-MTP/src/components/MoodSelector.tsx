import { MOODS } from '../lib/habits.ts';

export function MoodSelector({
  value,
  onChange,
  note,
  onNoteChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
  note: string;
  onNoteChange: (n: string) => void;
}) {
  return (
    <div role="group" aria-label="Stimmung">
      <p className="text-sm text-[var(--ink-muted)] mb-2">Wie fühlst du dich heute?</p>
      <div className="flex justify-between gap-2">
        {MOODS.map((m) => (
          <button
            key={m.value}
            data-testid={`mood-${m.value}`}
            aria-pressed={value === m.value}
            aria-label={m.label}
            title={m.label}
            onClick={() => onChange(m.value)}
            className="flex-1 aspect-square rounded-2xl border transition-colors touch-manipulation"
            style={{
              backgroundColor: value === m.value ? 'var(--accent)' : 'var(--surface-2)',
              borderColor: value === m.value ? 'var(--accent)' : 'var(--edge)',
            }}
          >
            <span className="text-2xl leading-none" aria-hidden="true">
              {m.emoji}
            </span>
          </button>
        ))}
      </div>
      <textarea
        value={note}
        placeholder="Optionale Kurznotiz…"
        onChange={(e) => onNoteChange(e.target.value)}
        className="mt-3 w-full resize-none rounded-xl border bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-[var(--accent-strong)]"
        style={{ borderColor: 'var(--edge)' }}
        rows={2}
        aria-label="Kurznotiz zur Stimmung"
      />
    </div>
  );
}
