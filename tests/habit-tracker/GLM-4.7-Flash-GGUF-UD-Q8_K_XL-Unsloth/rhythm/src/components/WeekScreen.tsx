import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getHabits, getCompletionsForHabit, getMoodEntriesForDateRange } from '../lib/db';
import { formatDate, formatDisplayDate, getStartOfWeek, getEndOfWeek } from '../lib/utils';

interface WeekScreenProps {
  onNavigateToToday: () => void;
}

export default function WeekScreen({ onNavigateToToday }: WeekScreenProps) {
  const [habits, setHabits] = useState<any[]>([]);
  const [moodData, setMoodData] = useState<any[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState<any[]>([]);
  
  useEffect(() => {
    loadHabits();
    loadMoodData();
  }, []);

  const loadHabits = async () => {
    const habits = await getHabits();
    setHabits(habits);
  };

  const loadMoodData = async () => {
    const endOfWeekDate = new Date(getEndOfWeek(new Date()));
    const startOfWeekDate = new Date(getStartOfWeek(new Date()));
    
    const entries = await getMoodEntriesForDateRange(
      formatDate(startOfWeekDate),
      formatDate(endOfWeekDate)
    );
    
    // Sort by date
    const sorted = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setMoodData(sorted);
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(formatDate(date));
    }
    return days;
  };

  const loadCompletionData = async (habitId: string | null) => {
    if (!habitId) {
      setCompletionData([]);
      return;
    }

    const last7Days = getLast7Days();
    const data = await Promise.all(last7Days.map(async (date) => {
      // Get completions for this date
      const completions = await getCompletionsForHabit(habitId, date, date);
      
      return {
        day: formatDisplayDate(date).split(' ')[0], // Just the date part
        completed: completions.length > 0,
      };
    }));
    
    setCompletionData(data);
  };

  const handleHabitClick = async (habitId: string) => {
    if (selectedHabitId === habitId) {
      setSelectedHabitId(null);
      await loadCompletionData(null);
    } else {
      setSelectedHabitId(habitId);
      await loadCompletionData(habitId);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4">
      {/* Header */}
      <header className="pt-6 pb-4">
        <h1 className="text-3xl font-bold mb-2">Woche</h1>
        <p className="text-muted-foreground">{formatDisplayDate(formatDate(getStartOfWeek(new Date())))} - {formatDisplayDate(formatDate(getEndOfWeek(new Date())))}</p>
      </header>

      {/* Mood Chart */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Stimmungsverlauf</h2>
        <div className="bg-surface rounded-xl p-4 border border-border/50">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={moodData.map((entry) => ({
              day: formatDisplayDate(entry.date).split(' ')[0],
              mood: entry.mood,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e7" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[1, 5]} 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Habits Selection */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Habit-Auswahl</h2>
        {habits.length === 0 ? (
          <div className="bg-surface rounded-xl p-4 border border-border/50 text-center text-muted-foreground">
            <p>Noch keine Habits erstellt.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map((habit) => {
              const isSelected = selectedHabitId === habit.id;
              return (
                <button
                  key={habit.id}
                  onClick={() => handleHabitClick(habit.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{habit.emoji}</span>
                    <span className="font-semibold text-lg">{habit.name}</span>
                    {isSelected && (
                      <span className="ml-auto text-primary">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Habit Completion Chart */}
      {selectedHabitId && completionData.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Abgeschlossene Habits</h2>
          <div className="bg-surface rounded-xl p-4 border border-border/50">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e7" />
                <XAxis 
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="completed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

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
