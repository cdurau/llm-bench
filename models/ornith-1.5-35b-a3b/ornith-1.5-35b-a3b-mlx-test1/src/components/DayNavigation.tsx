interface Props {
  label: string;
  isFuture: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

/** Tagesnavigation: Tag für Tag vor/zurück, Sprung zu „Heute". */
export function DayNavigation({
  label,
  isFuture,
  onPrev,
  onNext,
  onToday,
}: Props) {
  return (
    <section className="card">
      <div className="daynav">
        <button type="button" aria-label="Voriger Tag" onClick={onPrev}>
          ‹
        </button>
        <div className="day-title">
          {label}
          <span className="sub">
            {isFuture ? 'Zukunft' : 'Dein Tag'}
          </span>
        </div>
        <button type="button" aria-label="Nächster Tag" onClick={onNext}>
          ›
        </button>
        <button type="button" className="btn btn-ghost today-btn" onClick={onToday}>
          Heute
        </button>
      </div>
      {isFuture && (
        <div className="is-future-badge">
          Dieser Tag liegt in der Zukunft und kann noch nicht abgehakt werden.
        </div>
      )}
    </section>
  );
}
