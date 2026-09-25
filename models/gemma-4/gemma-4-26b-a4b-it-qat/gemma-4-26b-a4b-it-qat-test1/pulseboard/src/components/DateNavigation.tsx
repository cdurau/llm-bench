import React from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DateNavigationProps {
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
}

export const DateNavigation: React.FC<DateNavigationProps> = ({ currentDate, onDateChange }) => {
  const today = new Date();
  const isToday = isSameDay(currentDate, today);

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => onDateChange(subDays(currentDate, 1))}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      <div className="flex flex-col items-center">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {isToday ? 'Heute' : format(currentDate, 'dd. MMMM yyyy')}
        </span>
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentDate, 'eeee')}
        </span>
      </div>

      <button
        onClick={() => onDateChange(addDays(currentDate, 1))}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        aria-label="Next day"
      >
        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
};
