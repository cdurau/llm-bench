import { useCallback, useEffect, useState } from 'react';
import type { AppState, Habit, MoodEntry } from './lib/db.ts';
import { loadState, saveState } from './lib/db.ts';
import { createHabit, type NewHabit } from './lib/habits.ts';
import { applyThemeClass, currentThemeLabel, getOverride, systemIsDark, toggleTheme, todayStr } from './lib/util.ts';
import { Nav } from './components/Nav.tsx';
import { TodayScreen, type TodayProgress } from './components/TodayScreen.tsx';
import { WeekScreen } from './components/WeekScreen.tsx';
import { SettingsScreen } from './components/SettingsScreen.tsx';
import { AddHabitModal } from './components/AddHabitModal.tsx';

type Tab = 'today' | 'week' | 'settings';

export default function App() {
  const [tab, setTab] = useState<Tab>('today');
  const [state, setState] = useState<AppState | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [themeLabel, setThemeLabel] = useState(currentThemeLabel());

  useEffect(() => {
    let mounted = true;
    applyThemeClass();
    loadState()
      .then((s) => {
        if (mounted) setState(s);
      })
      .catch(() => {
        /* IndexedDB kann gesperrt sein – App bleibt im leeren Ausgangszustand. */
      });
    return () => {
      mounted = false;
    };
  }, []);

  const commit = useCallback(async (next: AppState) => {
    await saveState(next);
    setState(next);
  }, []);

  const today = todayStr();

  const progress: TodayProgress = {
    done: state ? state.habits.filter((h) => h.completedDates.includes(today)).length : 0,
    total: state?.habits.length ?? 0,
  };

  const moodEntry: MoodEntry | null = state
    ? state.moods.find((m) => m.date === today) ?? null
    : null;

  const openAdd = () => {
    setEditing(null);
    setAdding(true);
  };

  const editHabit = useCallback((h: Habit) => {
    setEditing(h);
    setAdding(true);
  }, []);

  const saveHabit = (h: NewHabit) => {
    if (!state) return;
    const trimmed = h.name.trim();
    if (!trimmed) return;
    if (editing) {
      commit({
        ...state,
        habits: state.habits.map((x) =>
          x.id === editing.id ? { ...x, name: trimmed, emoji: h.emoji, color: h.color } : x,
        ),
      });
    } else {
      commit({ ...state, habits: [...state.habits, createHabit(h)] });
    }
    setAdding(false);
    setEditing(null);
  };

  const closeModal = () => {
    setAdding(false);
    setEditing(null);
  };

  const toggleHabit = useCallback(
    (id: string) => {
      if (!state) return;
      const next = {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== id) return h;
          const set = new Set(h.completedDates);
          if (set.has(today)) set.delete(today);
          else set.add(today);
          return { ...h, completedDates: [...set] };
        }),
      };
      commit(next);
    },
    [state, today, commit],
  );

  const setMood = useCallback(
    (value: number) => {
      if (!state) return;
      const existing = state.moods.find((m) => m.date === today);
      const moods = existing
        ? state.moods.map((m) => (m.date === today ? { ...m, value } : m))
        : [...state.moods, { date: today, value, note: '' }];
      commit({ ...state, moods });
    },
    [state, today, commit],
  );

  const setMoodNote = useCallback(
    (note: string) => {
      if (!state || !moodEntry) return;
      const moods = state.moods.map((m) => (m.date === today ? { ...m, note } : m));
      commit({ ...state, moods });
    },
    [state, today, moodEntry, commit],
  );

  const deleteHabit = useCallback(
    (id: string) => {
      if (!state) return;
      commit({ ...state, habits: state.habits.filter((h) => h.id !== id) });
    },
    [state, commit],
  );

  const onToggleTheme = () => {
    toggleTheme();
    setThemeLabel(currentThemeLabel());
  };

  return (
    <>
      <div
        className="min-h-screen transition-colors"
        style={{ backgroundColor: 'var(--surface)', color: 'var(--ink)' }}
      >
        <div className="mx-auto w-full max-w-[360px] min-h-screen px-5 pb-28">
          {state === null ? (
            <p className="pt-10 text-sm text-[var(--ink-muted)]">Rhythm lädt …</p>
          ) : tab === 'today' ? (
            <TodayScreen
              habits={state.habits}
              progress={progress}
              moodToday={{ value: moodEntry?.value ?? null, note: moodEntry?.note ?? '' }}
              onToggle={toggleHabit}
              onAdd={openAdd}
              onSetMood={setMood}
              onMoodNote={setMoodNote}
              onEditHabit={editHabit}
              onDeleteHabit={deleteHabit}
            />
          ) : tab === 'week' ? (
            <WeekScreen habits={state.habits} moods={state.moods} onAdd={openAdd} />
          ) : (
            <SettingsScreen
              habits={state.habits}
              themeLabel={themeLabel}
              onToggleTheme={onToggleTheme}
              onEditHabit={editHabit}
              onDeleteHabit={deleteHabit}
              onAdd={openAdd}
            />
          )}
        </div>
      </div>

      <Nav active={tab} onNavigate={setTab} />

      <AddHabitModal
        open={adding}
        initial={editing ?? undefined}
        onClose={closeModal}
        onSave={saveHabit}
      />
    </>
  );
}
