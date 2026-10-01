import { useState, useEffect } from 'react';
import { getMoodForDate, setMood } from '../db';

const MOODS = [
  { value: 1, emoji: '😞', label: 'Schlecht' },
  { value: 2, emoji: '😕', label: 'So so' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Gut' },
  { value: 5, emoji: '😄', label: 'Super' },
];

function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  useEffect(() => {
    loadTodayMood();
  }, []);

  async function loadTodayMood() {
    const today = new Date().toISOString().split('T')[0];
    const mood = await getMoodForDate(today);
    if (mood) {
      setSelectedMood(mood.mood);
    }
  }

  async function handleSelectMood(value: number) {
    setSelectedMood(value);
    const today = new Date().toISOString().split('T')[0];
    await setMood({ date: today, mood: value });
  }

  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Wie fühlst du dich heute?</h3>
      <div className="flex justify-between">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            data-testid={`mood-${mood.value}`}
            aria-pressed={selectedMood === mood.value}
            onClick={() => handleSelectMood(mood.value)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
              selectedMood === mood.value
                ? 'bg-blue-500 text-white scale-110'
                : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {mood.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoodSelector;
