import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Habit } from '../lib/types';
import { habitChipVars } from '../lib/colors';
import { Icon } from './ui';

export default function HabitCard({
  habit,
  completed,
  streak,
  longest,
  onToggle,
  index = 0
}: {
  habit: Habit;
  completed: boolean;
  streak: number;
  longest: number;
  onToggle: () => void;
  index?: number;
}) {
  const chipVars = habitChipVars(habit.color) as CSSProperties;

  const [popped, setPopped] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (completed) {
      setPopped(true);
      const t = setTimeout(() => setPopped(false), 420);
      return () => clearTimeout(t);
    }
  }, [completed]);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={completed}
      aria-label={`${habit.name} — ${completed ? 'abhaken' : 'erledigt markieren'}`}
      style={{ ...chipVars, '--i': index } as CSSProperties}
      className="surface-lift flex w-full items-center gap-3.5 rounded-2xl border border-line bg-card p-3.5 text-left"
    >
      <span
        className={`habit-chip grid h-12 w-12 shrink-0 place-items-center rounded-xl text-[26px] transition-all duration-200 ${
          completed ? 'habit-chip-done' : ''
        }`}
      >
        {habit.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[16px] font-semibold leading-snug transition-colors ${
            completed ? 'text-muted' : 'text-ink'
          }`}
        >
          {habit.name}
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-muted">
          {streak > 0 ? (
            <>
              <Icon name="flame" size={13} className="text-clay" strokeWidth={2.6} />
              <span>
                <span className="font-mono tracking-tight">{streak}</span>{' '}
                {streak === 1 ? 'Tag' : 'Tage'} Serie
              </span>
            </>
          ) : (
            <span className="text-faint">Noch keine Serie</span>
          )}
          {longest > streak && (
            <span className="text-faint">· Rekord {longest}</span>
          )}
        </span>
      </span>
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 ${
          completed ? 'border-transparent bg-accent text-accent-fg' : 'border-line bg-transparent text-transparent'
        } ${popped ? 'check-pop' : ''}`}
        aria-hidden="true"
      >
        <Icon name="check" size={17} strokeWidth={3} />
      </span>
    </button>
  );
}
