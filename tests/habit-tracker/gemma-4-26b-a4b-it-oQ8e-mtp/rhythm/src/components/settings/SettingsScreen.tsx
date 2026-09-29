import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getHabits, saveHabit, deleteHabit } from '../../lib/services';
import { type Habit } from '../../lib/db';
import { type ThemeMode } from '../../lib/db';
import { Plus, Trash2 } from 'lucide-react';
import HabitForm from './HabitForm';

interface SettingsScreenProps {}

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const { theme, setTheme } = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const loadHabits = async () => {
    const h = await getHabits();
    setHabits(h);
  };

  // Load habits on mount
  useEffect(() => {
    loadHabits();
  }, []);

  const handleAddOrEditHabit = async (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = editingHabit 
      ? { ...editingHabit, ...habitData }
      : {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          ...habitData
        };
    
    await saveHabit(newHabit);
    await loadHabits();
    setIsHabitFormOpen(false);
    setEditingHabit(null);
  };

  const handleDeleteHabit = async (id: string) => {
    if (confirm('Möchtest du dieses Habit wirklich löschen? Alle Daten dazu gehen verloren.')) {
      await deleteHabit(id);
      await loadHabits();
    }
  };

  const openEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsHabitFormOpen(true);
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Erscheinungsbild</h2>
        <div className="card p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Design-Modus</span>
            <div className="flex bg-[var(--border)] p-1 rounded-xl">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setTheme(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    theme === m ? 'bg-[var(--card-bg)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {m === 'light' ? 'Hell' : m === 'dark' ? 'Dunkel' : 'System'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Deine Habits</h2>
          <button 
            onClick={() => {
              setEditingHabit(null);
              setIsHabitFormOpen(true);
            }}
            className="p-2 rounded-full bg-[var(--accent-bg)] text-[var(--accent)]"
          >
            <Plus size={20} />
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="py-12 text-center space-y-4 card">
            <p className="text-[var(--text-muted)]">Noch keine Habits vorhanden.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map(habit => (
              <div key={habit.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => openEditHabit(habit)}>
                  <span className="text-xl">{habit.emoji}</span>
                  <span className="font-medium">{habit.name}</span>
                </div>
                <button 
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="text-red-500 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {isHabitFormOpen && (
        <HabitForm 
          habit={editingHabit ?? undefined} 
          onSave={handleAddOrEditHabit} 
          onCancel={() => {
            setIsHabitFormOpen(false);
            setEditingHabit(null);
          }} 
        />
      )}
    </div>
  );
};

export default SettingsScreen;
