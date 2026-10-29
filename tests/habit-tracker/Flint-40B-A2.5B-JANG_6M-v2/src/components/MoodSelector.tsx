const MOODS: ReadonlyArray<{ value: number; emoji: string; label: string }> = [
  { value: 1, emoji: '😢', label: 'Schlecht' },
  { value: 2, emoji: '🙁', label: 'Eher schlecht' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Gut' },
  { value: 5, emoji: '😄', label: 'Sehr gut' },
];

interface MoodSelectorProps {
  value: number | undefined;
  note: string;
  onChange: (value: number) => void;
  onNoteChange: (note: string) => void;
}

export default function MoodSelector({ value, note, onChange, onNoteChange }: MoodSelectorProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="font-serif text-xl">Wie fühlst du dich?</h2>
      <p className="mt-1 text-sm text-muted">Eine kurze Auswahl für heute.</p>
      <div className="mt-4 grid grid-cols-5 gap-1">
        {MOODS.map((m) => {
          const selected = value === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange(m.value)}
              aria-pressed={selected}
              className={`flex flex-col items-center gap-1 rounded-lg py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                selected ? 'bg-accent-soft' : 'hover:bg-surface-2'
              }`}
            >
              <span className="text-2xl" aria-hidden="true">
                {m.emoji}
              </span>
              <span className="text-[10px] text-muted">{m.label}</span>
            </button>
          );
        })}
      </div>
      <input
        type="text"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Kurznotiz (optional)"
        aria-label="Kurznotiz zur Stimmung"
        className="mt-4 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 outline-none focus:border-ink"
      />
    </section>
  );
}