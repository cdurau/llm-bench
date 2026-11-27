import { useEffect, useRef, useState } from 'react';
import { MOODS } from '../lib/moods';
import type { MoodEntry } from '../lib/types';
import { Icon } from './ui';

export default function MoodPicker({
  moodEntry,
  onSelect,
  onRemove
}: {
  moodEntry: MoodEntry | null;
  onSelect: (mood: number, note: string) => void;
  onRemove: () => void;
}) {
  const selected = moodEntry?.mood ?? null;
  const [note, setNote] = useState(moodEntry?.note ?? '');
  const lastSavedNote = useRef(moodEntry?.note ?? '');

  useEffect(() => {
    setNote(moodEntry?.note ?? '');
    lastSavedNote.current = moodEntry?.note ?? '';
  }, [moodEntry?.date, moodEntry?.mood]);

  // debounce note saves
  useEffect(() => {
    if (selected == null) return;
    if (note === lastSavedNote.current) return;
    const t = setTimeout(() => {
      onSelect(selected, note);
      lastSavedNote.current = note;
    }, 350);
    return () => clearTimeout(t);
  }, [note, selected, onSelect]);

  const handlePick = (value: number) => {
    if (selected === value) {
      onRemove();
      return;
    }
    onSelect(value, note);
    lastSavedNote.current = note;
  };

  return (
    <div>
      <p className="mb-1.5 text-[15px] font-semibold text-ink">Wie geht es dir heute?</p>
      <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Stimmung wählen">
        {MOODS.map((m) => {
          const isActive = selected === m.value;
          return (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`Stimmung ${m.value}: ${m.label}`}
              onClick={() => handlePick(m.value)}
              className={`flex h-14 items-center justify-center rounded-xl border transition-all duration-200 ${
                isActive
                  ? 'border-clay bg-clay-soft text-ink scale-[1.06]'
                  : 'border-transparent hover:bg-subtle'
              }`}
            >
              <span className="text-[26px] leading-none">{m.emoji}</span>
            </button>
          );
        })}
      </div>

      {selected != null && (
        <div className="fade-in mt-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Kurznotiz (optional)"
            maxLength={240}
            rows={2}
            aria-label="Kurznotiz zur Stimmung"
            className="w-full resize-none rounded-xl border border-line bg-canvas px-3 py-2.5 text-[14px] leading-relaxed text-ink placeholder:text-faint"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              {MOODS.find((m) => m.value === selected)?.label}
            </p>
            <button
              type="button"
              onClick={onRemove}
              aria-label="Stimmung entfernen"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12px] font-medium text-muted transition-colors hover:bg-subtle hover:text-rose-600 dark:hover:text-rose-300"
            >
              <Icon name="trash" size={13} />
              Löschen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
