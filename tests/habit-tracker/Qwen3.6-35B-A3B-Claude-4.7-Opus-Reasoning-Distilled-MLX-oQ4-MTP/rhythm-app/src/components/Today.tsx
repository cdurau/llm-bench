import { useState, useEffect } from 'react';
import {
  getHabits as loadHabits,
  getChecksForDate as loadChecks,
  getMoodEntry as loadMood,
  checkHabit,
  uncheckHabit,
  saveMoodEntry,
  today,
  formatDate,
} from '../lib/db';
import type { Habit, MoodValue, MoodEntry } from '../lib/types';
import { IconCheck } from '../icons';
import { MOOD_EMOJIS, moodLabel } from '../lib/mood';
import { calcStreak } from '../lib/streaks';

function MoodPicker({
  initial,
  date,
  loadMood,
}: {
  initial: MoodEntry | undefined;
  date: string;
  loadMood: (d: string) => Promise<MoodEntry | undefined>;
}) {
  const [selected, setSelected] = useState<MoodValue | null>(
    initial ? initial.mood : null
  );
  const [note, setNote] = useState(initial ? initial.note : '');
  const [entry, setEntry] = useState(initial);

  async function handleSave() {
    if (selected == null) return;
    await saveMoodEntry(selected, note);
    setEntry(await loadMood(date));
  }

  return (
    <div>
      <div className="flex justify-center gap-3">
        {([1, 2, 3, 4, 5] as MoodValue[]).map((v) => (
          <button
            key={v}
            onClick={() => setSelected(v)}
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500"
            style={{
              backgroundColor: (entry && entry.mood === v) ? '#f5f5f4' : '#fff',
              border: (entry && entry.mood === v) ? '1px solid #d6d3d1' : '1px solid transparent',
            }}
            aria-label={moodLabel(v)}
          >
            {MOOD_EMOJIS[v]}
          </button>
        ))}
      </div>
      {selected != null && (
        <p className="text-center text-[12px] text-neutral-500 mt-2">
          {moodLabel(selected)}
        </p>
      )}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional eine Notiz..."
        className="w-full mt-3 px-3 py-2.5 rounded-xl text-[13px] resize-none outline-none"
        style={{ backgroundColor: '#fff', border: '1px solid #e7e5e4' }}
        rows={2}
      />
      <button
        onClick={handleSave}
        className="mt-3 w-full py-2.5 rounded-xl text-[14px] font-medium transition active:scale-98"
        style={{ backgroundColor: '#1c1917', color: '#fff' }}
      >
        Gespeichert
      </button>
    </div>
  );
}

export function Today() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayChecks, setTodayChecks] = useState<string[]>([]);
  const [checks, setChecks] = useState<Array<{ habitId: string; date: string }>>([]);
  const [moodEntry, setMoodEntry] = useState<MoodEntry | undefined>();
  const date = today();
  const done = todayChecks.length;

  useEffect(() => {
    (async () => {
      const h = await loadHabits();
      const c = await loadChecks(date);
      const m = await loadMood(date);
      setHabits(h);
      setTodayChecks(c.map((e) => e.habitId));
      setChecks(c);
      setMoodEntry(m);
    })();
  }, [date]);

  async function toggle(id: string) {
    const was = todayChecks.includes(id);
    if (was) {
      await uncheckHabit(id, date);
    } else {
      await checkHabit(id, date);
    }
    const updated = await loadChecks(date);
    setTodayChecks(updated.map((e) => e.habitId));
  }

  return (
    <div className="max-w-md mx-auto px-5 py-6">
      <p className="text-[12px] uppercase tracking-[0.08em] font-medium text-neutral-500 mb-1">
        {formatDate(new Date(date))}
      </p>
      {habits.length > 0 && (
        <p className="text-[12px] text-neutral-500 mb-4">
          {done} von {habits.length} erledigt
        </p>
      )}
      {habits.length === 0 ? (
        <div className="pt-16 text-center">
          <p className="text-neutral-400 text-[14px]">
            Noch keine Habits angelegt.
          </p>
          <p className="text-neutral-400 text-[14px] mt-1">
            Erstelle deinen ersten in den Einstellungen.
          </p>
        </div>
      ) : (
        habits.map((h) => {
          const isDone = todayChecks.includes(h.id);
          const streak = calcStreak(checks, h.id);

          return (
            <button
              key={h.id}
              onClick={() => toggle(h.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                width: '100%',
                cursor: 'pointer',
                marginBottom: 10,
                borderRadius: 16,
                backgroundColor: isDone ? h.color + '12' : '#fff',
                border: `1px solid ${isDone ? h.color + '28' : '#e7e5e4'}`,
                color: isDone ? h.color + '77' : undefined,
                outline: 'none',
              }}
              aria-label={`${isDone ? `${h.name} rückgängig` : `${h.name} abgeschlossen`}`}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition"
                style={{
                  backgroundColor: isDone ? h.color : h.color + '12',
                  color: isDone ? '#fff' : h.color,
                }}
              >
                <IconCheck size={15} />
              </span>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[14px]" style={{
                  fontWeight: 500,
                  textDecoration: isDone ? 'line-through' : undefined,
                }}>
                  {h.name}
                </p>
                {streak.current > 1 && (
                  <p className="text-[11px] mt-1" style={{ color: h.color }}>
                    {streak.current}x {streak.longest > streak.current ? `/ ${streak.longest}` : ''}
                  </p>
                )}
              </div>
            </button>
          );
        })
      )}

      {/* mood */}
      {habits.length > 0 && (
        <div className="mt-5">
          <p className="text-[12px] uppercase tracking-[0.08em] text-neutral-500 mb-2">
            Stimmung
          </p>
          <MoodPicker
            initial={moodEntry}
            date={date}
            loadMood={loadMood}
          />
        </div>
      )}
    </div>
  );
}
