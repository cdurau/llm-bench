import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearDatabase,
  deleteEntry,
  deleteHabit as deleteHabitFromDb,
  getAllEntries,
  getHabits,
  getMoods,
  putEntry,
  putHabit,
  saveMood as saveMoodRecord,
} from '../lib/db';
import { todayKey } from '../lib/date';
import type { Habit, HabitEntry, MoodEntry } from '../lib/types';

export interface NewHabitData {
  name: string;
  emoji: string;
  color: string;
}

interface AppContextValue {
  habits: Habit[];
  entries: HabitEntry[];
  moods: MoodEntry[];
  mood: MoodEntry | undefined;
  loading: boolean;
  isDone: (habitId: string, date: string) => boolean;
  datesByHabit: Map<string, Set<string>>;
  toggleHabit: (habitId: string) => void;
  addHabit: (data: NewHabitData) => void;
  updateHabit: (
    id: string,
    patch: Partial<Pick<Habit, 'name' | 'emoji' | 'color'>>,
  ) => void;
  deleteHabit: (id: string) => void;
  saveMood: (value: number, note: string) => void;
  clearAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [habitList, entryList, moodList] = await Promise.all([
        getHabits(),
        getAllEntries(),
        getMoods(),
      ]);
      if (cancelled) return;
      setHabits(habitList);
      setEntries(entryList);
      setMoods(moodList);
      setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const datesByHabit = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const entry of entries) {
      const set = map.get(entry.habitId) ?? new Set<string>();
      set.add(entry.date);
      map.set(entry.habitId, set);
    }
    return map;
  }, [entries]);

  const isDone = (habitId: string, date: string): boolean =>
    datesByHabit.get(habitId)?.has(date) ?? false;

  const toggleHabit = (habitId: string): void => {
    const date = todayKey();
    const id = `${habitId}|${date}`;
    const existing = entries.find((e) => e.id === id);
    if (existing) {
      void deleteEntry(id).then(() => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      });
      return;
    }
    const entry: HabitEntry = { id, habitId, date, createdAt: Date.now() };
    void putEntry(entry).then(() => {
      setEntries((prev) => [...prev.filter((e) => e.id !== id), entry]);
    });
  };

  const addHabit = (data: NewHabitData): void => {
    const habit: Habit = { id: crypto.randomUUID(), createdAt: Date.now(), ...data };
    void putHabit(habit).then(() => {
      setHabits((prev) => [...prev, habit]);
    });
  };

  const updateHabit = (
    id: string,
    patch: Partial<Pick<Habit, 'name' | 'emoji' | 'color'>>,
  ): void => {
    const target = habits.find((h) => h.id === id);
    const next = target ? { ...target, ...patch } : null;
    if (next) {
      void putHabit(next).then(() => {
        setHabits((prev) => prev.map((h) => (h.id === id ? next : h)));
      });
    }
  };

  const deleteHabit = (id: string): void => {
    void deleteHabitFromDb(id).then(() => {
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setEntries((prev) => prev.filter((e) => e.habitId !== id));
    });
  };

  const saveMood = (value: number, note: string): void => {
    const entry: MoodEntry = { date: todayKey(), value, note };
    void saveMoodRecord(entry).then(() => {
      setMoods((prev) => {
        const rest = prev.filter((m) => m.date !== entry.date);
        return [...rest, entry].sort((a, b) => a.date.localeCompare(b.date));
      });
    });
  };

  const clearAll = (): void => {
    void clearDatabase().then(() => {
      setHabits([]);
      setEntries([]);
      setMoods([]);
    });
  };

  const mood = moods.find((m) => m.date === todayKey());

  const value: AppContextValue = {
    habits,
    entries,
    moods,
    mood,
    loading,
    isDone,
    datesByHabit,
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    saveMood,
    clearAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppData muss innerhalb von AppProvider verwendet werden');
  }
  return ctx;
}