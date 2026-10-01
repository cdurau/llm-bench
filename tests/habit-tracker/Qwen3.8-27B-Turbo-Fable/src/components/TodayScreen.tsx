import { useState, useEffect } from 'react';
import HabitItem from './HabitItem';
import MoodSelector from './MoodSelector';
import { getHabits, addHabit, isCompleted, toggleCompletion } from '../db';

function TodayScreen() {
  const [habits, setHabits] = useState<any[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  useEffect(() => {
    loadHabits();
  }, []);

  async function loadHabits() {
    const h = await getHabits();
    setHabits(h);

    const today = new Date().toISOString().split('T')[0];
    const ids = new Set<string>();
    for (const habit of h) {
      if (await isCompleted(habit.id, today)) {
        ids.add(habit.id);
      }
    }
    setCompletedIds(ids);
  }

  async function handleAddHabit() {
    if (!newHabitName.trim()) return;

    const emojis = ['💧', '📖', '🏃', '🧘', '✍️', '🎯'];
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    await addHabit({
      name: newHabitName.trim(),
      emoji: randomEmoji,
      color: randomColor,
    });

    setNewHabitName('');
    setShowAddForm(false);
    loadHabits();
  }

  async function handleToggle(habitId: string) {
    const today = new Date().toISOString().split('T')[0];
    await toggleCompletion(habitId, today);
    loadHabits();
  }

  const today = new Date();
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{dayNames[today.getDay()]}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {today.getDate()}. {monthNames[today.getMonth()]} {today.getFullYear()}
        </p>
      </header>

      <div className="mb-6">
        <span data-testid="progress" className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {completedIds.size} von {habits.length}
        </span>
      </div>

      <MoodSelector />

      {habits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 dark:text-gray-500 mb-4">Noch keine Habits angelegt.</p>
          <button
            data-testid="habit-add"
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Erstes Habit anlegen
          </button>
        </div>
      ) : (
        <>
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              isCompleted={completedIds.has(habit.id)}
              onToggle={() => handleToggle(habit.id)}
            />
          ))}

          <button
            data-testid="habit-add"
            onClick={() => setShowAddForm(true)}
            className="w-full mt-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-3 rounded-lg"
          >
            + Neues Habit
          </button>
        </>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-[100]">
          <div className="bg-white dark:bg-gray-900 w-full p-4 rounded-t-xl">
            <h2 className="text-lg font-semibold mb-4">Neues Habit</h2>
            <input
              data-testid="habit-name"
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Was möchtest du tun?"
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 bg-white dark:bg-gray-800"
            />
            <button
              data-testid="habit-save"
              onClick={handleAddHabit}
              className="w-full bg-blue-500 text-white py-3 rounded-lg"
            >
              Speichern
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodayScreen;
