// --- Single habit row ---

import type { HabitWithStreaks } from '../useHabits';

interface Props {
  habit: HabitWithStreaks;
  onToggle: (id: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

export function HabitItem({ habit, onToggle, index = 0, onEdit, onDelete }: Props) {
  const { name, emoji, color, completedToday, currentStreak } = habit;

  return (
    <div
      className="group flex items-center gap-4 bg-surface rounded-lg border border-border px-4 py-3 shadow-card hover:shadow-card-hover transition-shadow animate-fade-in"
      style={{ '--index': index } as React.CSSProperties}
    >
      {/* Color accent */}
      <div className="w-1 h-12 rounded-full shrink-0" style={{ backgroundColor: color }} />

      {/* Tap target */}
      <button
        onClick={() => onToggle(habit.id)}
        className="flex items-center gap-3 flex-1 min-h-[52px] text-left"
        aria-pressed={completedToday}
        aria-label={`${completedToday ? 'Deaktivieren' : 'Abhaken'}: ${name}`}
      >
        {/* Checkbox */}
        <span
          className={`relative flex items-center justify-center w-7 h-7 rounded-md border-2 shrink-0 transition-colors ${
            completedToday ? 'border-0 bg-accent text-white' : 'border-border-strong bg-surface-alt'
          }`}
          style={completedToday ? { backgroundColor: color } : {}}
        >
          {completedToday && <span className="animate-check-pop"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg></span>}
        </span>

        {/* Emoji + name */}
        <span className="text-2xl leading-none" aria-hidden="true">{emoji}</span>
        <span className="text-[15px] font-medium text-ink truncate">{name}</span>
      </button>

      {/* Streak + Aktionen */}
      <div className="flex items-center gap-1 shrink-0">
        {currentStreak > 0 && (
          <span className="flex items-center gap-1 text-xs font-medium text-ink-muted tabular-nums">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2c1 4-2 6-2 9a3 3 0 0 0 6 0c0-2 2-3 2-5 0 5-3 8-6 8s-6-3-6-8c0 2 1 3 2 4 0-3 1-5 4-8z" /></svg>
            {currentStreak}
          </span>
        )}
        {onEdit && (
          <button type="button" onClick={onEdit} className="min-h-[44px] w-11 h-11 rounded-lg flex items-center justify-center text-ink-faint hover:bg-surface-alt active:scale-[0.95]" aria-label="Habit bearbeiten">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} className="min-h-[44px] w-11 h-11 rounded-lg flex items-center justify-center text-ink-faint hover:bg-surface-alt active:scale-[0.95]" aria-label="Habit löschen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
