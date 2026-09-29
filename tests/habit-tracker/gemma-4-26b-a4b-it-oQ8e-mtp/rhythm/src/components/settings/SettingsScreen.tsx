import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getHabits, saveHabit, deleteHabit } from '../lib/services';
import { type Habit } from '../lib/db';
import { Plus, Trash2 } from 'lucide-react';
import HabitForm from './habits/HabitForm';

interface SettingsScreenProps {}

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const loadHabits = async () => {
    const h = await getHabits();
    setHabits(h);
  };

  // Load habits on mount
  React.useEffect(() => {
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
        <div className="card p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <button 
            onClick={toggleDarkMode}
            className="w-12 h-6 rounded-full relative transition-colors"
            style={{ backgroundColor: darkMode ? 'var(--accent)' : 'var(--border)' }}
          >
            <div 
              className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: darkMode ? '26px' : '4px' }}
            />
          </button>
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
                <div className="flex items-center space-x-3" onClick={() => openEditHabit(habit)}>
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
          habit={editingHabit} 
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

// Helper components for icons if not imported
const Moon = ({ size }: { size: number }) => <MoonIcon size={size} />;
const Sun = ({ size }: { size: number }) => <SunIcon size={size} />;
const MoonIcon = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const SunIcon = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;

export default SettingsScreen;
