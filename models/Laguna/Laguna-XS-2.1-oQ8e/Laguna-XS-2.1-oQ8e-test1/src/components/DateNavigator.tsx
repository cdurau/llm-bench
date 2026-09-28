import { useState, useEffect } from 'react';

interface DateNavigatorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateNavigator({ currentDate, onDateChange }: DateNavigatorProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const formatted = currentDate.toISOString().split('T')[0];
    setInputValue(formatted);
  }, [currentDate]);

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newDate = new Date(currentDate);
    // Nächsten Tag, aber nicht weiter als heute + 1 Tag (für zukünftige Ansicht)
    if (newDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
      newDate.setDate(newDate.getDate() + 1);
      onDateChange(newDate);
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const parts = inputValue.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const newDate = new Date(year, month - 1, day);
        if (!isNaN(newDate.getTime())) {
          onDateChange(newDate);
        }
      }
    }
  };

  const isFutureDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return currentDate > today;
  };

  return (
    <nav className="date-navigator" aria-label="Datumsnavigation">
      <button
        type="button"
        onClick={handlePrevDay}
        aria-label="Vorheriger Tag"
        title="Vorheriger Tag"
      >
        ←
      </button>
      
      <div className="date-display">
        <div className="date-weekday">{formatDisplayDate(currentDate)}</div>
        <input
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          aria-label="Datum auswählen"
        />
        {isFutureDate() && (
          <span className="future-indicator" title="Zukünftiges Datum">
            (Zukunft)
          </span>
        )}
      </div>
      
      <button
        type="button"
        onClick={handleToday}
        aria-label="Heute"
        title="Heute"
      >
        heute
      </button>
      
      <button
        type="button"
        onClick={handleNextDay}
        aria-label="Nächster Tag"
        title="Nächster Tag"
      >
        →
      </button>
    </nav>
  );
}