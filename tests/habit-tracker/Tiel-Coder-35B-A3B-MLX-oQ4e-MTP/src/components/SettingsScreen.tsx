import type { Habit } from '../lib/db.ts';
import { toggleTheme } from '../lib/util.ts';
import { HabitItem } from './HabitItem.tsx';
import { EmptyState } from './EmptyState.tsx';

export function SettingsScreen({
  habits,
  themeLabel,
  onToggleTheme,
  onEditHabit,
  onDeleteHabit,
  onAdd,
}: {
  habits: Habit[];
  themeLabel: string;
  onToggleTheme: () => void;
  onEditHabit: (h: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <>
      <header className="pt-6 pb-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-muted)]">Einstellungen</p>
        <h2 className="mt-1.5 text-xl font-medium tracking-tight" style={{ color: 'var(--ink)' }}>
          Design & Daten
        </h2>
      </header>

      <section aria-label="Erscheinungsbild" className="mb-8">
        <p className="text-sm text-[var(--ink-muted)] mb-3">Erscheinungsbild</p>
        <div
          className="flex items-center justify-between rounded-2xl border bg-[var(--surface)] px-4 py-3"
          style={{ borderColor: 'var(--edge)' }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
            {themeLabel}
          </span>
          <button
            data-testid="theme-toggle"
            onClick={onToggleTheme}
            aria-pressed={false}
            className="rounded-xl px-3 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Umschalten
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--ink-muted)]">
          Die Auswahl wird gespeichert und funktioniert vollständig offline.
        </p>
      </section>

      <section aria-label="Habits" className="mb-8">
        <p className="text-sm text-[var(--ink-muted)] mb-3">Habits</p>
        {habits.length === 0 ? (
          <EmptyState title="Noch keine Habits" hint="Lege auf dem Heute-Screen dein erstes Habit an." />
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                completed={false}
                onToggle={() => {}}
                onEdit={() => onEditHabit(habit)}
                onDelete={() => onDeleteHabit(habit.id)}
              />
            ))}
          </div>
        )}
      </section>

      <button
        data-testid="habit-add"
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white transition-colors"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        <span aria-hidden="true">+</span> Neues Habit anlegen
      </button>
    </>
  );
}
