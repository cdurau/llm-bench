import { useMemo, useState, type CSSProperties } from 'react';
import type { RhythmData } from '../lib/useRhythmData';
import { todayString, formatLongDate } from '../lib/dates';
import { currentStreak, longestStreak } from '../lib/streaks';
import HabitCard from '../components/HabitCard';
import MoodPicker from '../components/MoodPicker';
import HabitEditor, { type HabitDraft } from '../components/HabitEditor';
import { Card, Icon, PrimaryButton, SectionLabel } from '../components/ui';
import type { Habit } from '../lib/types';

export default function TodayScreen({ data }: { data: RhythmData }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const today = todayString();

  const habitStats = useMemo(() => {
    return data.habits.map((h) => {
      const dates = new Set<string>();
      for (const [date, ids] of data.done) {
        if (ids.has(h.id)) dates.add(date);
      }
      return { habit: h, current: currentStreak(dates, today), longest: longestStreak(dates) };
    });
  }, [data.habits, data.done, today]);

  const doneToday = data.done.get(today)?.size ?? 0;
  const total = data.habits.length;
  const progress = total === 0 ? 0 : doneToday / total;

  if (!data.ready) {
    return (
      <div className="screen-enter flex flex-col gap-4" aria-busy="true">
        <div className="h-[120px] w-full animate-pulse rounded-2xl bg-subtle" />
        <div className="h-[72px] w-full animate-pulse rounded-2xl bg-subtle" />
        <div className="h-[96px] w-full animate-pulse rounded-2xl bg-subtle" />
      </div>
    );
  }

  const handleSubmit = (draft: HabitDraft) => {
    const habit: Habit = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `h-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: draft.name,
      emoji: draft.emoji,
      color: draft.color,
      createdAt: Date.now()
    };
    void data.addHabit(habit);
    setEditorOpen(false);
  };

  return (
    <div className="screen-enter flex flex-col gap-4">
      <header style={{ '--i': 0 } as CSSProperties}>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
          {formatLongDate(today)}
        </p>
        <h1 className="mt-1 font-serif text-[34px] font-medium leading-tight tracking-tight">
          Heute
        </h1>
      </header>

      {total > 0 && (
        <Card className="p-4" >
          <div style={{ '--i': 1 } as CSSProperties} className="flex items-baseline justify-between gap-3">
            <span className="text-[15px] font-semibold text-ink">Fortschritt</span>
            <span className="font-mono text-[13px] tracking-tight text-muted">
              {doneToday} von {total}
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-subtle">
            <div
              className="progress-fill h-full rounded-full bg-clay"
              style={{ width: `${progress * 100}%` }}
              role="progressbar"
              aria-valuenow={doneToday}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-label="Heutiger Fortschritt"
            />
          </div>
          <p className="mt-2.5 text-[12px] leading-relaxed text-muted">
            {progress === 1
              ? 'Alles erledigt — gut gemacht.'
              : progress === 0
                ? 'Starte deinen Tag mit einer Gewohnheit.'
                : 'Weiter so — steig weiter auf.'}
          </p>
        </Card>
      )}

      {total === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-5 py-12 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-clay-soft text-clay">
            <Icon name="layers" size={28} strokeWidth={1.9} />
          </span>
          <div>
            <h2 className="font-serif text-[22px] font-medium tracking-tight">
              Noch keine Gewohnheiten
            </h2>
            <p className="mx-auto mt-1.5 max-w-[270px] text-[14px] leading-relaxed text-muted">
              Leg deine erste Gewohnheit an — z. B. 10 Minuten lesen, ein Glas Wasser oder ein
              kurzes Dehnen.
            </p>
          </div>
          <PrimaryButton onClick={() => setEditorOpen(true)} className="mt-1">
            <Icon name="plus" size={17} strokeWidth={2.6} />
            Gewohnheit anlegen
          </PrimaryButton>
        </Card>
      ) : (
        <section aria-label="Gewohnheiten" style={{ '--i': 2 } as CSSProperties}>
          <div className="flex items-center justify-between">
            <SectionLabel>Heute · {total} {total === 1 ? 'Gewohnheit' : 'Gewohnheiten'}</SectionLabel>
            <button
              type="button"
              onClick={() => setEditorOpen(true)}
              className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              <Icon name="plus" size={15} strokeWidth={2.6} />
              Neue
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            {habitStats.map(({ habit, current, longest }, i) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completed={data.done.get(today)?.has(habit.id) ?? false}
                streak={current}
                longest={longest}
                onToggle={() => data.toggleHabit(habit.id)}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      <Card className="p-4" >
        <SectionLabel>Stimmung</SectionLabel>
        <MoodPicker
          moodEntry={data.moods[today] ?? null}
          onSelect={(mood, note) => data.setMood(today, mood, note)}
          onRemove={() => data.removeMood(today)}
        />
      </Card>

      {editorOpen && (
        <HabitEditor initial={null} onSubmit={handleSubmit} onClose={() => setEditorOpen(false)} />
      )}
    </div>
  );
}
