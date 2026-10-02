import type { Habit } from '../lib/db.ts';
import { computeStreaks } from '../lib/util.ts';

export function HabitItem({
  habit,
  completed,
  onToggle,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const streak = computeStreaks(habit.completedDates);

  return (
    <div
      data-testid="habit-item"
      className="flex items-center gap-3 rounded-2xl border bg-[var(--surface)] px-3 py-3 transition-opacity"
      style={{ borderColor: 'var(--edge)', opacity: completed ? 0.55 : 1 }}
    >
      <button
        data-testid="habit-toggle"
        aria-pressed={completed}
        aria-label={`${habit.emoji} ${habit.name} als erledigt markieren`}
        onClick={onToggle}
        className="flex shrink-0 items-center justify-center rounded-full border-2 transition-colors"
        style={{
          width: '44px',
          height: '44px',
          borderColor: habit.color,
          color: habit.color,
          backgroundColor: completed ? habit.color : 'transparent',
          opacity: completed ? 1 : 0.9,
        }}
      >
        {completed ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="text-lg" style={{ color: habit.color }}>
            {habit.emoji}
          </span>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium" style={{ color: 'var(--ink)' }}>
            {habit.name}
          </span>
        </div>
        <div data-testid="habit-streak" className="mt-0.5 text-sm text-[var(--ink-muted)]">
          Serie {streak.current} · Rekord {streak.longest}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onEdit}
          aria-label={`${habit.name} umbenennen`}
          className="rounded-lg px-2 py-1 text-sm text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-2)]"
        >
          Ändern
        </button>
        <button
          onClick={onDelete}
          aria-label={`${habit.name} löschen`}
          className="rounded-lg px-2 py-1 text-sm text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-2)]"
        >
          Löschen
        </button>
      </div>
    </div>
  );
}
