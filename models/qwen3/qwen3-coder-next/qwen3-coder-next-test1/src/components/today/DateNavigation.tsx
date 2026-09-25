import { formatDisplayDate } from '@/utils/storage';
import { Button } from '@/components/common/Button';

interface DateNavigationProps {
  currentDate: string;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export function DateNavigation({ currentDate, onPreviousDay, onNextDay, onToday }: DateNavigationProps) {
  const today = new Date().toISOString().split('T')[0];
  const isToday = currentDate === today;
  
  return (
    <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 px-6 py-3 mb-6">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onPreviousDay}
          disabled={!isToday && new Date(currentDate + 'T00:00:00') <= new Date(today + 'T00:00:00')}
          aria-label="Vorheriger Tag"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        
        <div className="text-center min-w-[200px]">
          <p className="font-semibold text-gray-900 dark:text-white">
            {formatDisplayDate(currentDate)}
          </p>
        </div>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={onNextDay}
          aria-label="Nächster Tag"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
      
      <Button variant="ghost" size="sm" onClick={onToday} disabled={isToday}>
        {isToday ? 'Heute' : 'Zu heute'}
      </Button>
    </div>
  );
}
