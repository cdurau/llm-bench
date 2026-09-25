import type { AppData } from '../types';

interface Props {
  activities: { activity: AppData['activities'][number]; isComplete: boolean }[];
  categoryStats: { name: string; total: number; done: number }[];
}

export function Dashboard({ activities, categoryStats }: Props) {
  const completed = activities.filter((a) => a.isComplete).length;
  const open = activities.length - completed;
  const percentage = activities.length > 0 ? Math.round((completed / activities.length) * 100) : 0;

  return (
    <div className="dashboard">
      <section className="stat-row">
        <div className="stat-card">
          <span className="stat-number">{completed}</span>
          <span className="stat-label">Erledigt</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{open}</span>
          <span className="stat-label">Offen</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{percentage}</span>
          <span className="stat-label">Prozent</span>
        </div>
      </section>

      <section className="category-stats">
        <h3>Nach Kategorie</h3>
        {categoryStats.length === 0 ? (
          <p className="empty-text">Noch keine Aktivitäten.</p>
        ) : (
          <ul className="cat-list">
            {categoryStats.map(({ name, total, done }) => (
              <li key={name} className="cat-item">
                <span className="cat-name">{name}</span>
                <span className="cat-bar-wrap">
                  <span
                    className="cat-bar"
                    style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                  />
                </span>
                <span className="cat-count">
                  {done}/{total}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
