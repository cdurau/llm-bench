import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { getHabits, getHabitLogsByDate, toggleHabitLog, getMoodLogByDate } from '../lib/services';
import { type Habit } from '../lib/db';
import { Plus } from 'lucide-react';
import HabitItem from './habits/HabitItem';
import MoodSelector from '../mood/MoodSelector';

const TodayScreen: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabitIds, setCompletedHabitIds] = useState<string[]>([]);
  const [today] = useState(new Date());
  const [mood, setMood] = useState<any>(null);

  const todayStr = format(today, 'yyyy-MM-dd');

  useEffect(() => {
    const loadData = async () => {
      const h = await getHabits();
      setHabits(h);
      const completed = await getHabitLogsByDate(todayStr);
      setCompletedHabitIds(completed);
      const m = await getMoodLogByDate(todayStr);
      setMood(m);
    };
    loadData();
  }, [todayStr]);

  const handleToggleHabit = async (habitId: string) => {
    await toggleHabitLog(habitId, todayStr);
    // Refresh local state
    const completed = await getHabitLogsByDate(todayStr);
    setCompletedHabitIds(completed);
  };

  const progress = habits.length > 0 
    ? Math.round((completedHabitIds.length / habits.length) * 100) 
    : 0;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {format(today, 'EEEE, d. MMMM', { locale: de })}
        </h1>
        <p className="text-[var(--text-muted)]">
          {completedHabitIds.length} von {habits.length} erledigt
        </p>
        <div className="w-full h-1.5 bg-[var(--border)] rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full bg-[var(--accent)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Deine Habits</h2>
        </div>
        
        {habits.length === 0 ? (
          <div className="py-12 text-center space-y-4 card">
            <div className="mx-auto w-12 h-12 rounded-full bg-[var(--accent-bg)] flex items-center justify-center text-[var(--accent)]">
              <Plus size={24} />
            </div>
            <p className="text-[var(--text-muted)]">Noch keine Habits angelegt.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map(habit => (
              <HabitItem 
                key={habit.id} 
                habit={habit} 
                isCompleted={completedHabitIds.includes(habit.id)}
                onToggle={() => handleToggleHabit(habit.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Stimmung</h2>
        <MoodSelector 
          currentMood={mood} 
          onMoodChange={(newMood) => setMood(newMood)} 
        />
      </section>
    </div>
  );
};

export default TodayScreen;
