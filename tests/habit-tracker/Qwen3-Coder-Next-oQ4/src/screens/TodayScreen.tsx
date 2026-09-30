import { useState, useEffect } from 'react';
import { useAppState } from '../context';
import { db } from '../database';
import { Badge } from '../components/ui/Badge';
import { formatDate, getColorClasses } from '../lib/utils';
import { HabitManager } from '../components/HabitManager';

export function TodayScreen() {
  const { habits } = useAppState();
  const [completedCount, setCompletedCount] = useState(0);
  const [isHabitAnimating, setIsHabitAnimating] = useState<string | null>(null);
  const [streak, setStreak] = useState<{ completed: boolean } | null>(null);

  useEffect(() => {
    checkCompletedHabits();
  }, [habits]);

  async function checkCompletedHabits() {
    const today = getTodayDateString();
    const storedStreak = await db.getStreaks(today);
    setStreak(storedStreak);
    
    if (storedStreak?.completed) {
      setCompletedCount(habits.length);
    } else {
      setCompletedCount(0);
    }
  }

  async function toggleHabit(habitId: string) {
    setIsHabitAnimating(habitId);
    
    const today = getTodayDateString();
    const existing = await db.getStreaks(today);
    
    let newCompletedCount = completedCount;
    
    if (existing && existing.completed) {
      await db.setStreak({ ...existing, completed: false });
      newCompletedCount = Math.max(0, completedCount - 1);
    } else {
      await db.setStreak({ date: today, completed: true });
      newCompletedCount = habits.length;
    }
    
    setCompletedCount(newCompletedCount);
    const newStreak = { completed: newCompletedCount === habits.length && habits.length > 0 };
    setStreak(newStreak);
    setTimeout(() => setIsHabitAnimating(null), 300);
  }

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <p className="text-gray-500 text-sm font-medium">
          {formatDate(new Date())}
        </p>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Guten Tag!
        </h1>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl font-semibold text-gray-900">
            {completedCount}
          </span>
          <span className="text-gray-500">von {habits.length} erledigt</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gray-900 h-full transition-all duration-500 ease-out"
            style={{ width: `${habits.length > 0 ? (completedCount / habits.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {habits.length === 0 ? (
          <HabitManager />
        ) : (
          habits.map((habit) => {
            const colorClasses = getColorClasses(habit.color);
            const isCompleted = streak?.completed && habits.length > 0;
            
            return (
              <Card
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`
                  group
                  ${isHabitAnimating === habit.id ? 'scale-[0.98] active:scale-95' : ''}
                  ${isCompleted ? 'bg-gray-50' : ''}
                `}
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
                      ${colorClasses.bg} ${colorClasses.text}
                    `}>
                      {habit.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {habit.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="neutral" size="sm">
                          {streak?.completed ? '🔥' : '•'}
                        </Badge>
                      </div>
                    </div>
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${isCompleted 
                        ? 'bg-gray-900 border-gray-900' 
                        : 'border-gray-300 bg-white'
                      }
                      transition-all duration-200
                    `}>
                      {isCompleted && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}

        <div className="pt-4">
          <HabitManager />
        </div>
      </div>
    </div>
  );
}

function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm 
        border border-gray-100
        ${onClick ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
