import { formatDisplayDate } from '../utils/date';
import { ActivityWithStatus } from '../types';

export interface DashboardProps {
  activities: ActivityWithStatus[];
  date: Date;
}

export function Dashboard({ activities, date }: DashboardProps) {
  const doneCount = activities.filter((a) => a.doneToday).length;
  const totalCount = activities.length;
  const openCount = totalCount - doneCount;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <section aria-label="Tagesübersicht" className="dashboard">
      <time className="dashboard-date" dateTime={date.toISOString()}>
        {formatDisplayDate(date)}
      </time>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{doneCount}</span>
          <span className="stat-label">Erledigt</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{openCount}</span>
          <span className="stat-label">Offen</span>
        </div>
      </div>

      <div className="progress-bar" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <span className="progress-label">{progressPercent}% abgeschlossen</span>

      <div className="category-overview">
        {Object.values(
          activities.reduce<Record<string, { total: number; done: number }>>(
            (acc, a) => {
              const existing = acc[a.category] || { total: 0, done: 0 };
              acc[a.category] = {
                total: existing.total + 1,
                done: existing.done + (a.doneToday ? 1 : 0),
              };
              return acc;
            },
            {}
          )
        )
          .sort((a, b) => b.total - a.total)
          .map(({ total, done }) => (
            <div key={`${done}-${total}`} className="mini-stat">
              <span>{done}/{total}</span>
            </div>
          ))}
      </div>
    </section>
  );
}
