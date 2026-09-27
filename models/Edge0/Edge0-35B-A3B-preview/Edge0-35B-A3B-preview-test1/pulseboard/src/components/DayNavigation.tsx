import { formatDateKey, formatDisplayDate } from '../utils/date';

export interface DayNavigationProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  maxDate?: Date;
}

export function DayNavigation({ currentDate, onPrev, onNext, onToday, maxDate }: DayNavigationProps) {
  const todayKey = formatDateKey(new Date());
  const currentKey = formatDateKey(currentDate);
  const isMax = maxDate ? formatDateKey(currentDate) === formatDateKey(maxDate) : false;
  const isPast = currentKey < todayKey;
  const isFuture = currentKey > todayKey;

  return (
    <nav className="day-nav" aria-label="Tagesnavigation">
      <div className="nav-controls">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Vorheriger Tag"
          title="Vorheriger Tag"
        >
          ←
        </button>

        <span className="nav-date" aria-live="polite">
          {formatDisplayDate(currentDate)}
          {(isFuture || (isMax && currentKey > todayKey)) && ' (Zukunft)'}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={isMax}
          aria-label="Nächster Tag"
          title={isMax ? 'Maximales Datum erreicht' : 'Nächster Tag'}
        >
          →
        </button>
      </div>

      {!isPast && (
        <button
          type="button"
          onClick={onToday}
          className="btn-secondary"
        >
          Zu heute wechseln
        </button>
      )}
    </nav>
  );
}
