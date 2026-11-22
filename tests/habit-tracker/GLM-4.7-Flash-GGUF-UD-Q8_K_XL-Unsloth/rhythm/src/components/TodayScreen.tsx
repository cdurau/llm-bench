import { useState, useEffect } from 'react';
import { addHabit, getHabits, deleteHabit, addCompletion, getMoodEntryForDate, addMoodEntry } from '../lib/db';
import HabitItem from './HabitItem';
import MoodSelector from './MoodSelector';
import { formatDate, isToday, formatDisplayDate } from '../lib/utils';

interface TodayScreenProps {
  onNavigateToWeek: () => void;
}

export default function TodayScreen({ onNavigateToWeek }: TodayScreenProps) {
  const [habits, setHabits] = useState<any[]>([]);
  const [moodEntry, setMoodEntry] = useState<any>(null);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitEmoji, setNewHabitEmoji] = useState('✨');
  const [newHabitColor, setNewHabitColor] = useState('#3B82F6');
  const todayDateString = formatDate(new Date());
  
  // Load data on mount
  useEffect(() => {
    loadHabits();
    loadMoodEntry();
  }, []);

  const loadHabits = async () => {
    const habits = await getHabits();
    setHabits(habits);
  };

  const loadMoodEntry = async () => {
    const entry = await getMoodEntryForDate(todayDateString);
    setMoodEntry(entry);
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    await addHabit({
      name: newHabitName,
      emoji: newHabitEmoji,
      color: newHabitColor,
      createdAt: Date.now(),
    });

    setNewHabitName('');
    setShowAddHabit(false);
    loadHabits();
  };

  const handleToggleHabit = async (habitId: string) => {
    // For simplicity, we're using createdAt as the "completion" date
    // In a real app, you'd have a separate completions table
    await addCompletion({
      habitId,
      date: todayDateString,
      completedAt: Date.now(),
    });
    loadHabits();
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Möchtest du diesen Habit wirklich löschen?')) return;
    
    await deleteHabit(habitId);
    loadHabits();
  };

  const handleSaveMood = async (moodValue: number) => {
    if (moodEntry) {
      // Update existing mood entry
      await addMoodEntry({
        date: todayDateString,
        mood: moodValue,
        createdAt: Date.now(),
      });
    } else {
      // Create new mood entry
      await addMoodEntry({
        date: todayDateString,
        mood: moodValue,
        createdAt: Date.now(),
      });
    }
    setMoodEntry(await getMoodEntryForDate(todayDateString));
  };

  const completedCount = habits.filter(h => isToday(h.createdAt.toString())).length;
  const totalCount = habits.length;

  return (
    <div className="min-h-screen pb-24 px-4">
      {/* Header */}
      <header className="pt-6 pb-4">
        <h1 className="text-3xl font-bold mb-2">Heute</h1>
        <p className="text-muted-foreground">{formatDisplayDate(new Date())}</p>
        
        {/* Progress */}
        {totalCount > 0 && (
          <div className="mt-4 bg-surface rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Fortschritt</span>
              <span className="text-sm text-muted-foreground">{completedCount} von {totalCount}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Mood Entry */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Stimmung heute</h2>
        <MoodSelector
          value={moodEntry?.mood}
          onChange={handleSaveMood}
          disabled={false}
        />
      </section>

      {/* Habits */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Meine Habits</h2>
          <button
            onClick={() => setShowAddHabit(!showAddHabit)}
            className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            + Neuer Habit
          </button>
        </div>

        {/* Add Habit Form */}
        {showAddHabit && (
          <form onSubmit={handleAddHabit} className="bg-surface rounded-xl p-4 border border-border/50 mb-4">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Habit Name..."
              className="w-full px-3 py-2 bg-background rounded-lg border border-border focus:outline-none focus:border-primary mb-2"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newHabitEmoji}
                onChange={(e) => setNewHabitEmoji(e.target.value)}
                placeholder="Emoji..."
                maxLength={2}
                className="w-16 px-3 py-2 bg-background rounded-lg border border-border focus:outline-none focus:border-primary text-center"
              />
              <select
                value={newHabitColor}
                onChange={(e) => setNewHabitColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-background rounded-lg border border-border focus:outline-none focus:border-primary"
              >
                {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'].map((color) => (
                  <option key={color} value={color} style={{ backgroundColor: color }}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          </form>
        )}

        {/* Habits List */}
        {habits.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-4xl mb-2">📝</p>
            <p>Noch keine Habits erstellt.</p>
            <p className="text-sm mt-1">Erstelle deinen ersten Habit!</p>
          </div>
        ) : (
          habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onToggle={handleToggleHabit}
              onDelete={() => handleDeleteHabit(habit.id)}
            />
          ))
        )}
      </section>

      {/* Week Navigation */}
      <button
        onClick={onNavigateToWeek}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        📊
      </button>
    </div>
  );
}
