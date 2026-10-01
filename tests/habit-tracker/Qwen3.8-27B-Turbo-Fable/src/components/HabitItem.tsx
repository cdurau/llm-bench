import { useState, useEffect } from 'react';
import { getCompletionsForHabit } from '../db';

interface HabitItemProps {
  habit: any;
  isCompleted: boolean;
  onToggle: () => void;
}

function HabitItem({ habit, isCompleted, onToggle }: HabitItemProps) {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    calculateStreaks();
  }, [isCompleted]);

  async function calculateStreaks() {
    const completions = await getCompletionsForHabit(habit.id);
    const dates = completions.map((c) => c.date).sort();

    // Calculate current streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i]);
      const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === i) {
        streak++;
      } else {
        break;
      }
    }
    setCurrentStreak(streak);

    // Calculate longest streak
    let maxStreak = 0;
    let currentRun = 0;
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        currentRun = 1;
      } else {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          currentRun++;
        } else {
          maxStreak = Math.max(maxStreak, currentRun);
          currentRun = 1;
        }
      }
    }
    maxStreak = Math.max(maxStreak, currentRun);
    setLongestStreak(maxStreak);
  }

  return (
    <div data-testid="habit-item" className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl mb-3 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{habit.emoji}</span>
        <div>
          <h3 className="font-medium">{habit.name}</h3>
          <span data-testid="habit-streak" className="text-xs text-gray-400 dark:text-gray-500">
            {currentStreak} / {longestStreak} Tage
          </span>
        </div>
      </div>

      <button
        data-testid="habit-toggle"
        aria-pressed={isCompleted}
        onClick={onToggle}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isCompleted
            ? 'bg-green-500 text-white'
            : 'border-2 border-gray-300 dark:border-gray-600 text-transparent'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>
  );
}

export default HabitItem;
