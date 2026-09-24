import { addDays, formatDayLabel, todayKey } from '../lib/date'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

interface DayNavigatorProps {
  selectedDate: string
  onSelectDate: (date: string) => void
}

/** Navigation zwischen Kalendertagen: gestern/heute/morgen + freies Blättern. */
export function DayNavigator({ selectedDate, onSelectDate }: DayNavigatorProps) {
  const today = todayKey()
  const isFuture = selectedDate > today

  return (
    <nav className="day-nav" aria-label="Tagesnavigation">
      <button
        type="button"
        className="day-nav__btn"
        onClick={() => onSelectDate(addDays(selectedDate, -1))}
        aria-label="Vorheriger Tag"
      >
        <ChevronLeftIcon />
      </button>

      <div className="day-nav__center">
        <div className="day-nav__label">{formatDayLabel(selectedDate)}</div>
        <div className="day-nav__sub">
          {isFuture ? 'Zukünftiger Tag' : 'Tagesfortschritt'}
        </div>
      </div>

      <button
        type="button"
        className="day-nav__btn"
        onClick={() => onSelectDate(addDays(selectedDate, 1))}
        aria-label="Nächster Tag"
      >
        <ChevronRightIcon />
      </button>

      <button
        type="button"
        className={`day-nav__today${selectedDate === today ? ' is-active' : ''}`}
        onClick={() => onSelectDate(today)}
      >
        Heute
      </button>
    </nav>
  )
}
