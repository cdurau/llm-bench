import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { db } from './database';
import type { Habit, AppState } from './types';

interface AppStateContextType {
  habits: Habit[];
  appState: AppState;
  addHabit: (habit: Habit) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  toggleDarkMode: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [appState, setAppState] = useState<AppState>({
    habits: [],
    moodRecords: [],
    darkMode: false,
  });

  useEffect(() => {
    loadState();
  }, []);

  async function loadState() {
    const state = await db.getAppState();
    if (state) {
      setAppState(state);
      setHabits(state.habits);
    }
  }

  async function addHabit(habit: Habit) {
    await db.addHabit(habit);
    const newHabits = [...habits, habit];
    setHabits(newHabits);
    await db.saveAppState({ ...appState, habits: newHabits });
  }

  async function updateHabit(updatedHabit: Habit) {
    await db.updateHabit(updatedHabit);
    const newHabits = habits.map(h => h.id === updatedHabit.id ? updatedHabit : h);
    setHabits(newHabits);
    await db.saveAppState({ ...appState, habits: newHabits });
  }

  async function deleteHabit(id: string) {
    await db.deleteHabit(id);
    const newHabits = habits.filter(h => h.id !== id);
    setHabits(newHabits);
    await db.saveAppState({ ...appState, habits: newHabits });
  }

  async function toggleDarkMode() {
    const newDarkMode = !appState.darkMode;
    const newState = { ...appState, darkMode: newDarkMode };
    await db.saveAppState(newState);
    setAppState(newState);
  }

  return (
    <AppStateContext.Provider value={{ habits, appState, addHabit, updateHabit, deleteHabit, toggleDarkMode }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
