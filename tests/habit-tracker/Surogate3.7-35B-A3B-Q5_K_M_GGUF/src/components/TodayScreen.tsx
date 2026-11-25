// --- Screen: Heute (Today) ---

import { useMemo } from 'react';
import { useHabits, type HabitWithStreaks } from '../useHabits';
import { HabitItem } from './HabitItem';
import { MoodPicker } from './MoodPicker';
import { EmptyState } from './EmptyState';
import { IconFlame, IconCheck } from './Icons';
import { toLocalDate, formatDate } from '../utils';
import { useMood } from '../useMood';

function TodayHeader() {
  const d = new Date();
  const weekday = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][d.getDay()];
  const day = d.getDate();
  const month = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'][d.getMonth()];
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-ink-faint font-semibold mb-1">{weekday}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold tracking-tight text-ink">{day}</span>
        <span className="text-xl text-ink-muted">{month}</span>
      </div>
    </div>
  );
}

function Progress({ habits }: { habits: HabitWithStreaks[] }) {
  const done = habits.filter((h) => h.completedToday).length;
  const total = habits.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="bg-surface rounded-lg border border-border px-4 py-4 shadow-card animate-fade-in">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-sm font-semibold text-ink">{done} von {total} erledigt</p>
        <p className="text-sm font-bold text-accent-text tabular-nums">{pct}%</p>
      </div>
      <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function TodayScreen({ onAddHabit, onEdit, onDelete }: { onAddHabit?: () => void; onEdit?: (h: HabitWithStreaks) => void; onDelete?: (h: HabitWithStreaks) => void }) {
  const { habits, loading, toggleToday } = useHabits();
  const { entry, loading: moodLoading, setMood } = useMood();

  const completed = habits.filter((h) => h.completedToday).length;

  const sorted = useMemo(() => {
    const order = (h: HabitWithStreaks) => (h.completedToday ? 1 : 0);
    return [...habits].sort((a, b) => order(b) - order(a));
  }, [habits]);

  return (
    <div className="px-5 pt-6 pb-28 space-y-5">
      <TodayHeader />
      <Progress habits={habits} />

      {/* Mood */}
      <section aria-label="Stimmung">
        <div className="flex items-center gap-2 mb-3">
          <IconFlame className="w-4 h-4 text-ink-faint" />
          <h2 className="text-sm uppercase tracking-wide text-ink-faint font-semibold">Stimmung heute</h2>
        </div>
        {moodLoading ? (
          <div className="h-32 bg-surface rounded-lg border border-border animate-pulse" />
        ) : entry ? (
          <div className="bg-surface rounded-lg border border-border p-5 shadow-card animate-fade-in">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl" aria-hidden="true">
                {['😣','😕','😐','🙂','😄'][entry.value - 1]}
              </span>
              <div>
                <p className="text-lg font-semibold text-ink">
                  {['Sehr schlecht','Schlecht','Neutral','Gut','Sehr gut'][entry.value - 1]}
                </p>
                {entry.note && <p className="text-sm text-ink-muted">„{entry.note}"</p>}
              </div>
            </div>
          </div>
        ) : (
          <MoodPicker
            value={0}
            onChange={(v) => setMood(v)}
            note=""
            onNoteChange={() => {}}
          />
        )}
      </section>

      {/* Habits */}
      <section aria-label="Habits">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm uppercase tracking-wide text-ink-faint font-semibold">Heutige Habits</h2>
          {completed > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-text bg-accent-soft px-2.5 py-1 rounded-full">
              <IconCheck className="w-3.5 h-3.5" /> {formatDate(toLocalDate())}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 bg-surface rounded-lg border border-border animate-pulse" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <EmptyState
            icon={<IconFlame className="w-8 h-8" />}
            title="Noch keine Habits"
            description="Lege dein erstes Habit an und starte deinen Rhythmus."
            action={onAddHabit ? <button type="button" onClick={onAddHabit} className="text-sm font-medium text-accent-text hover:underline">Habits anlegen →</button> : <a href="#einstellungen" className="text-sm font-medium text-accent-text hover:underline">Habits anlegen →</a>}
          />
        ) : (
          <div className="space-y-3 stagger-in">
            {sorted.map((h, i) => (
              <HabitItem key={h.id} habit={h} index={i} onToggle={toggleToday} onEdit={() => onEdit?.(h)} onDelete={() => onDelete?.(h)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
