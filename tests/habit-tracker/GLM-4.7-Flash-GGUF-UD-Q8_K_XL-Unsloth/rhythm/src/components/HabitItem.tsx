import { useState } from 'react';
import type { Habit } from '../lib/db';
import { isToday, getDaysSince } from '../lib/utils';

interface HabitItemProps {
  habit: Habit;
  onToggle?: (date: string) => void;
  onDelete?: () => void;
}

export default function HabitItem({ habit, onToggle, onDelete }: HabitItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const currentStreak = getDaysSince(habit.createdAt.toString());
  
  return (
    <div className="bg-surface rounded-xl p-4 shadow-sm border border-border/50 transition-all hover:shadow-md">
      <div className="flex items-center gap-3">
        {/* Habit Checkbox */}
        <button
          onClick={() => onToggle?.(habit.id)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
            isToday(habit.createdAt.toString())
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
          }`}
          aria-label={`Habit ${habit.name} abhaken`}
        >
          {isToday(habit.createdAt.toString()) && (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Habit Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{habit.emoji} {habit.name}</h3>
          
          {/* Streaks */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              🔥 Aktuell: {currentStreak} Tage
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Erstellt: {new Date(habit.createdAt).toLocaleDateString('de-DE')}
              </p>
              <button
                onClick={onDelete}
                className="mt-2 text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                Habit löschen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
