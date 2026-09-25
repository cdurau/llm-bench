interface Props {
  selectedDate: string;
  yesterday: string;
  tomorrow: string;
  onNavigate: (date: string) => void;
  onToday: () => void;
}

export function DayNavigator({
  selectedDate,
  yesterday,
  tomorrow,
  onNavigate,
  onToday,
}: Props) {
  return (
    <nav className="day-nav" aria-label="Tagesauswahl">
      <button
        className="day-nav-btn"
        onClick={() => onNavigate(yesterday)}
        aria-label="Voriger Tag"
      >
        ‹
      </button>
      <button
        className="day-nav-btn day-nav-today"
        onClick={onToday}
        aria-label="Heute"
      >
        Heute
      </button>
      <div className="day-nav-date">{selectedDate}</div>
      <button
        className="day-nav-btn"
        onClick={() => onNavigate(tomorrow)}
        aria-label="Nächster Tag"
      >
        ›
      </button>
    </nav>
  );
}
