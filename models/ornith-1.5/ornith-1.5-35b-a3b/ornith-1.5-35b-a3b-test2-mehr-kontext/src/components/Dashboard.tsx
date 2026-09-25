import type { DayStats } from '../store/createStore'
import { SparkleIcon } from './icons'

interface DashboardProps {
  stats: DayStats
}

/** Fortschrittsbalken. */
function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Tagesfortschritt">
      <div className="progress__track">
        <div className="progress__fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="progress__value">{percent}%</span>
    </div>
  )
}

/** Übersicht nach Kategorie. */
function CategoryOverview({ byCategory }: { byCategory: DayStats['byCategory'] }) {
  if (byCategory.length === 0) {
    return null
  }
  return (
    <div className="categories">
      <h2 className="categories__title">Kategorien</h2>
      <ul className="categories__list">
        {byCategory.map((c) => {
          const catPercent = c.total === 0 ? 0 : Math.round((c.completed / c.total) * 100)
          return (
            <li key={c.name} className="category">
              <div className="category__top">
                <span className="category__name">{c.name}</span>
                <span className="category__count">
                  {c.completed}/{c.total}
                </span>
              </div>
              <div className="progress progress--sm">
                <div className="progress__track">
                  <div className="progress__fill" style={{ width: `${catPercent}%` }} />
                </div>
                <span className="progress__value progress__value--sm">{catPercent}%</span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Dashboard: erledigt/offen/Prozent + Kategorie-Übersicht. */
export function Dashboard({ stats }: DashboardProps) {
  const { completed, open, percent } = stats

  return (
    <section className="dashboard" aria-label="Tagesübersicht">
      <div className="dashboard__stats">
        <Stat icon={<SparkleIcon />} label="Erledigt" value={completed} highlight />
        <Stat icon={<SparkleIcon />} label="Offen" value={open} />
        <Stat icon={<SparkleIcon />} label="Gesamt" value={stats.total} />
      </div>

      <ProgressBar percent={percent} />

      <CategoryOverview byCategory={stats.byCategory} />
    </section>
  )
}

function Stat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div className="stat" aria-label={label}>
      <div className="stat__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="stat__value" data-highlight={Boolean(highlight)}>
        {value}
      </div>
      <div className="stat__label">{label}</div>
    </div>
  )
}
