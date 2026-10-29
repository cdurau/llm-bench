import { useEffect, useState } from 'react';
import { IconPlus } from '../components/icons';
import HabitCard from '../components/HabitCard';
import HabitComposer from '../components/HabitComposer';
import MoodSelector from '../components/MoodSelector';
import { useAppData, type NewHabitData } from '../hooks/useAppData';
import { computeStreak } from '../lib/streaks';
import { formatDate, todayKey } from '../lib/date';
import type { Habit } from '../lib/types';

export default function TodayScreen() {
  const {
    habits,
    loading,
    mood,
    isDone,
    datesByHabit,
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    saveMood,
  } = useAppData();

  const [composerOpen, setComposerOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [moodValue, setMoodValue] = useState<number | undefined>(mood?.value);
  const [moodNote, setMoodNote] = useState(mood?.note);

  useEffect(() => {
    setMoodValue(mood?.value);
    setMoodNote(mood?.note);
  }, [mood]);

  const today = todayKey();
  const doneCount = habits.filter((h) => isDone(h.id, today)).length;
  const remaining = habits.length - doneCount;

  const openAdd = () => {
    setEditingHabit(null);
    setComposerOpen(true);
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setEditingHabit(null);
  };

  const handleSave = (data: NewHabitData) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, data);
    } else {
      addHabit(data);
    }
    closeComposer();
  };

  const handleMoodChange = (value: number) => {
    setMoodValue(value);
    saveMood(value, moodNote ?? '');
  };

  const handleNoteChange = (note: string) => {
    setMoodNote(note);
    saveMood(moodValue ?? 3, note);
  };

  const progress = habits.length > 0 ? doneCount / habits.length : 0;

  return (
    <div>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-[-0.02em] text-ink">rhythm</h1>
          <p className="mt-2 text-sm text-muted">{formatDate()}</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex h-11 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <IconPlus className="h-5 w-5" />
          Habit anlegen
        </button>
      </header>

      {loading ? (
        <p className="mt-8 text-sm text-muted">Lade deine Daten …</p>
      ) : habits.length > 0 ? (
        <section className="mt-8" aria-label="Heutige Fortschritt">
          <h2 className="font-serif text-4xl tracking-[-0.02em] text-ink">
            {doneCount} von {habits.length}
          </h2>
          <div className="mt-3 h-1 w-full overflow-hidden bg-surface-2">
            <div className="h-full bg-accent" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted">
            {remaining > 0 ? `${remaining} offen` : 'Alle Habits erledigt.'}
          </p>
        </section>
      ) : (
        <section className="mt-8" aria-label="Willkommen">
          <h2 className="font-serif text-4xl tracking-[-0.02em] text-ink">Willkommen.</h2>
          <p className="mt-2 text-sm text-muted">Lege deinen ersten Habit an, um loszulegen.</p>
        </section>
      )}

      <section className="mt-8" aria-label="Stimmung heute">
        <MoodSelector value={moodValue} note={moodNote ?? ''} onChange={handleMoodChange} onNoteChange={handleNoteChange} />
      </section>

      {!loading && habits.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {habits.map((habit) => (
            <li key={habit.id}>
              <HabitCard
                habit={habit}
                done={isDone(habit.id, today)}
                streak={computeStreak(datesByHabit.get(habit.id) ?? new Set<string>())}
                editing={editingId === habit.id}
                onToggle={toggleHabit}
                onEdit={setEditingId}
                onUpdate={updateHabit}
                onDelete={deleteHabit}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {composerOpen ? <HabitComposer habit={editingHabit} onClose={closeComposer} onSave={handleSave} /> : null}
    </div>
  );
}