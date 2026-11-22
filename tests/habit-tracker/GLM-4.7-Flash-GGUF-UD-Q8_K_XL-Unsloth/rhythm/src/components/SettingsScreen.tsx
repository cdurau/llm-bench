import { useState, useEffect } from 'react';
import { getHabits, deleteHabit } from '../lib/db';
import { MOOD_OPTIONS, isToday } from '../lib/utils';

interface SettingsScreenProps {
  onNavigateToToday: () => void;
}

export default function SettingsScreen({ onNavigateToToday }: SettingsScreenProps) {
  const [habits, setHabits] = useState<any[]>([]);
  
  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const habits = await getHabits();
    setHabits(habits);
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Möchtest du diesen Habit wirklich löschen?')) return;
    
    await deleteHabit(habitId);
    loadHabits();
  };

  return (
    <div className="min-h-screen pb-24 px-4">
      {/* Header */}
      <header className="pt-6 pb-4">
        <h1 className="text-3xl font-bold mb-2">Einstellungen</h1>
        <p className="text-muted-foreground">App-Einstellungen und Verwaltung</p>
      </header>

      {/* App Info */}
      <section className="mt-6 bg-surface rounded-xl p-4 border border-border/50">
        <h2 className="text-lg font-semibold mb-3">Über Rhythm</h2>
        <div className="space-y-2 text-muted-foreground">
          <p>Habit- und Stimmungs-Tracker</p>
          <p>v1.0.0</p>
        </div>
      </section>

      {/* Habits List */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Meine Habits ({habits.length})</h2>
        
        {habits.length === 0 ? (
          <div className="bg-surface rounded-xl p-4 border border-border/50 text-center text-muted-foreground">
            <p className="text-4xl mb-2">📝</p>
            <p>Noch keine Habits erstellt.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => {
              const currentStreak = isToday(habit.createdAt) ? 1 : 0;
              return (
                <div key={habit.id} className="bg-surface rounded-xl p-4 border border-border/50">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{habit.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{habit.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        🔥 Aktuell: {currentStreak} Tage
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Mood Settings */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Stimmungs-Einstellungen</h2>
        <div className="bg-surface rounded-xl p-4 border border-border/50">
          <p className="text-sm text-muted-foreground">
            Aktuelle Optionen: {MOOD_OPTIONS.map(m => m.emoji).join(' ')}
          </p>
        </div>
      </section>

      {/* Back to Today */}
      <button
        onClick={onNavigateToToday}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        ↩
      </button>
    </div>
  );
}
