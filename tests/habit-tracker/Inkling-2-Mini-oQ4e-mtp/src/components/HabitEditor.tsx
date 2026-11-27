import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Habit } from '../lib/types';
import { getHabitColor, HABIT_EMOJIS, HABIT_COLOR_KEYS } from '../lib/colors';
import { Icon } from './ui';

export interface HabitDraft {
  name: string;
  emoji: string;
  color: Habit['color'];
}

export default function HabitEditor({
  initial,
  onSubmit,
  onClose
}: {
  initial: HabitDraft | null;
  onSubmit: (draft: HabitDraft) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🏃');
  const [color, setColor] = useState(initial?.color ?? 'terracotta');
  const [error, setError] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHydrated(true);
    const t = setTimeout(() => nameRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) {
      setError('Bitte einen Namen eingeben.');
      nameRef.current?.focus();
      return;
    }
    onSubmit({ name: name.trim(), emoji, color });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={initial ? 'Gewohnheit bearbeiten' : 'Gewohnheit anlegen'}>
      <button
        aria-label="Schließen"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
      />
      <form
        onSubmit={submit}
        className={`relative w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl border border-line bg-card p-5 shadow-card transition-opacity ${hydrated ? 'fade-in' : 'opacity-0'}`}
        style={{ maxHeight: '92vh', overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-[22px] font-medium tracking-tight">
            {initial ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-ink"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <label htmlFor="habit-name" className="mb-1 block text-[13px] font-semibold text-muted">
          Name
        </label>
        <input
          id="habit-name"
          ref={nameRef}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          placeholder="z. B. Laufen"
          maxLength={32}
          className="mb-3 h-12 w-full rounded-xl border border-line bg-canvas px-4 text-[16px] text-ink placeholder:text-faint focus:border-clay"
        />
        {error && <p className="-mt-1.5 mb-3 text-[13px] font-medium text-rose-700 dark:text-rose-300" role="alert">{error}</p>}

        <p className="mb-2 text-[13px] font-semibold text-muted">Symbol</p>
        <div className="mb-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Symbol wählen">
          {HABIT_EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              role="radio"
              aria-checked={emoji === em}
              aria-label={`Symbol ${em}`}
              onClick={() => setEmoji(em)}
              className={`h-11 w-11 rounded-full border text-[22px] leading-none transition-all ${
                emoji === em
                  ? 'border-clay bg-clay-soft text-ink scale-110'
                  : 'border-line bg-card text-ink hover:border-faint'
              }`}
            >
              {em}
            </button>
          ))}
        </div>

        <p className="mb-2 text-[13px] font-semibold text-muted">Farbe</p>
        <div className="mb-5 flex flex-wrap gap-2.5" role="radiogroup" aria-label="Farbe wählen">
          {HABIT_COLOR_KEYS.map((key) => {
            const spec = getHabitColor(key);
            const selected = color === key;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={spec.label}
                title={spec.label}
                onClick={() => setColor(key)}
                className={`h-11 w-11 rounded-full border-2 transition-all ${
                  selected ? 'scale-110' : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: spec.swatch,
                  borderColor: selected ? 'var(--ink)' : 'transparent',
                  boxShadow: selected ? '0 0 0 3px var(--card), 0 0 0 5px var(--ink)' : 'none'
                }}
              />
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-xl border border-line bg-card text-[15px] font-semibold text-ink transition-colors hover:bg-subtle"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="h-12 flex-1 rounded-xl bg-accent text-[15px] font-semibold text-accent-fg transition-opacity hover:opacity-90"
          >
            {initial ? 'Speichern' : 'Anlegen'}
          </button>
        </div>
      </form>
    </div>
  );
}

