import type { Habit } from '../lib/db.ts';
import { formatGermanDate, todayStr } from '../lib/util.ts';
import { HabitItem } from './HabitItem.tsx';
import { MoodSelector } from './MoodSelector.tsx';
import { EmptyState } from './EmptyState.tsx';

export interface TodayProgress {
  done: number;
  total: number;
}

export function TodayScreen({
  habits,
  progress,
  moodToday,
  onToggle,
  onAdd,
  onSetMood,
  onMoodNote,
  onEditHabit,
  onDeleteHabit,
}: {
  habits: Habit[];
  progress: TodayProgress;
  moodToday: { value: number | null; note: string };
  onToggle: (id: string) => void;
  onAdd: () => void;
  onSetMood: (v: number) => void;
  onMoodNote: (n: string) => void;
  onEditHabit: (h: Habit) => void;
  onDeleteHabit: (id: string) => void;
}) {
  const today = todayStr();

  return (
    <>
      <header className="pt-6 pb-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-muted)]">Rhythm</p>
        <h2 className="mt-1.5 text-xl font-medium tracking-tight" style={{ color: 'var(--ink)' }}>
          {formatGermanDate(today)}
        </h2>
        <div data-testid="progress" className="mt-3 text-3xl font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>
          {progress.done} von {progress.total}
        </div>
      </header>

      <section aria-label="Stimmung" className="mb-6">
        <MoodSelector value={moodToday.value} onChange={onSetMood} note={moodToday.note} onNoteChange={onMoodNote} />
      </section>

      {habits.length === 0 ? (
        <EmptyState
          title="Noch keine Habits"
          hint="Lege auf dem Heute-Screen dein erstes Habit an und markiere es täglich. Stimmung trägst du direkt unten ein."
        />
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              completed={habit.completedDates.includes(today)}
              onToggle={() => onToggle(habit.id)}
              onEdit={() => onEditHabit(habit)}
              onDelete={() => onDeleteHabit(habit.id)}
            />
          ))}
        </div>
      )}

      <button
        data-testid="habit-add"
        onClick={onAdd}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white transition-colors"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        <span aria-hidden="true">+</span> Neues Habit anlegen
      </button>
    </>
  );
}
