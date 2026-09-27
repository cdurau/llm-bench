import type { DayKey } from '../lib/types';
import type { DayStats } from '../state/store';
import { addDays, formatLong, isFuture, isToday } from '../lib/dates';
import { PulseLine } from './PulseLine';
import { IconChevronLeft, IconChevronRight } from './icons';

interface DayHeaderProps {
  day: DayKey;
  stats: DayStats;
  onSelectDay: (day: DayKey) => void;
}

/** Kopfbereich: Tagesnavigation, Datum, Pulslinie und Instrumenten-Anzeige. */
export function DayHeader({ day, stats, onSelectDay }: DayHeaderProps) {
  const today = isToday(day);
  const future = isFuture(day);

  return (
    <section className="day" aria-label="Tagesübersicht">
      <nav className="day__nav" aria-label="Tagesnavigation">
        <button
          type="button"
          className="navbtn"
          onClick={() => onSelectDay(addDays(day, -1))}
          aria-label="Vorheriger Tag"
        >
          <IconChevronLeft />
        </button>
        <button
          type="button"
          className={`navbtn navbtn--today${today ? ' is-active' : ''}`}
          onClick={() => onSelectDay(addDays(day, 0))}
          disabled={today}
        >
          Heute
        </button>
        <button
          type="button"
          className="navbtn"
          onClick={() => onSelectDay(addDays(day, 1))}
          aria-label="Nächster Tag"
        >
          <IconChevronRight />
        </button>
      </nav>

      <h1 className="day__title">
        {formatLong(day)}
        {future && <span className="day__tag">künftiger Tag</span>}
        {!today && !future && <span className="day__tag">vergangener Tag</span>}
      </h1>

      <PulseLine percent={stats.percent} />

      <dl className="stats">
        <div className="stat">
          <dt className="stat__label">Erledigt</dt>
          <dd className="stat__value">{stats.done}</dd>
        </div>
        <div className="stat">
          <dt className="stat__label">Offen</dt>
          <dd className="stat__value">{stats.open}</dd>
        </div>
        <div className="stat">
          <dt className="stat__label">Fortschritt</dt>
          <dd className="stat__value">{stats.percent} %</dd>
        </div>
      </dl>

      {future && (
        <p className="day__note">
          Dies ist ein künftiger Tag – hier kann noch nichts abgehackt werden.
        </p>
      )}
      {!future && stats.total > 0 && stats.open === 0 && (
        <p className="day__note day__note--done">Alles für diesen Tag erledigt.</p>
      )}
    </section>
  );
}
