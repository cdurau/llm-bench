import type { Activity } from '../types';

interface DashboardProps {
  activities: Activity[];
  completedCount: number;
  totalCount: number;
}

export function Dashboard({ activities, completedCount, totalCount }: DashboardProps) {
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // Nach Kategorien gruppieren
  const byCategory = activities.reduce<Record<string, { total: number; completed: number }>>(
    (acc, activity) => {
      const cat = activity.category;
      if (!acc[cat]) {
        acc[cat] = { total: 0, completed: 0 };
      }
      acc[cat].total += 1;
      return acc;
    },
    {}
  );

  return (
    <section className="dashboard" aria-labelledby="dashboard-heading">
      <h2 id="dashboard-heading">Übersicht</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{completedCount}</div>
          <div className="stat-label">Erledigt</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{totalCount - completedCount}</div>
          <div className="stat-label">Offen</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{progress}%</div>
          <div className="stat-label">Fortschritt</div>
        </div>
      </div>
      
      <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <h3>Nach Kategorie</h3>
      <div className="category-grid">
        {Object.entries(byCategory).map(([category, counts]) => (
          <div key={category} className="category-item">
            <span className="category-name">{category}</span>
            <span className="category-count">
              {counts.completed} / {counts.total}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}