import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { type Habit } from '../../lib/db';
import { calculateStreaks } from '../../lib/services';

interface HabitItemProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, isCompleted, onToggle }) => {
  const [streaks, setStreaks] = React.useState<{ current: number; longest: number }>({ current: 0, longest: 0 });

  React.useEffect(() => {
    const loadStreaks = async () => {
      const { getHabitLogs } = await import('../../lib/services');
      const logs = await getHabitLogs();
      setStreaks(calculateStreaks(habit.id, logs));
    };
    loadStreaks();
  }, [habit.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 flex items-center justify-between group"
    >
      <div className="flex items-center space-x-4" onClick={onToggle}>
        <button 
          className="focus:outline-none"
          aria-label={isCompleted ? "Habit abwählen" : "Habit abhaken"}
        >
          {isCompleted ? (
            <CheckCircle2 className="text-[var(--accent)]" size={28} />
          ) : (
            <Circle className="text-[var(--text-muted)]" size={28} />
          )}
        </button>
        
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{habit.emoji}</span>
            <span className={`font-medium ${isCompleted ? 'line-through text-[var(--text-muted)]' : ''}`}>
              {habit.name}
            </span>
          </div>
          <div className="text-xs text-[var(--text-muted)] flex space-x-3 mt-0.5">
            <span>🔥 {streaks.current} Tage</span>
            <span>🏆 {streaks.longest} max.</span>
          </div>
        </div>
      </div>

      <div 
        className="w-2 h-8 rounded-full"
        style={{ backgroundColor: habit.color }}
      />
    </motion.div>
  );
};

export default HabitItem;
