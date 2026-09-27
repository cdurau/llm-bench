import { useState, useCallback } from 'react';
import { useActivities, useActivitiesWithStatus } from '../hooks/useActivities';
import { formatDateKey } from '../utils/date';
import { ActivityList } from './ActivityList';
import { Dashboard } from './Dashboard';
import { DayNavigation } from './DayNavigation';
import { EmptyState } from './EmptyState';

export const CATEGORIES = [
  'Gesundheit',
  'Produktivität',
  'Lernen',
  'Soziales',
  'Freizeit',
  'Sonstiges',
] as const;

export function App() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const stored = localStorage.getItem('pulseboard-current-date');
    if (stored) {
      const parsed = new Date(stored);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return today;
  });
  const [maxFutureDate] = useState<Date>(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return d;
  });

  const saveDate = useCallback((d: Date) => {
    localStorage.setItem('pulseboard-current-date', d.toISOString());
    setCurrentDate(d);
  }, []);

  const goPrev = useCallback(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    if (d <= maxFutureDate) saveDate(d);
  }, [currentDate, maxFutureDate, saveDate]);

  const goNext = useCallback(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    if (d <= maxFutureDate) saveDate(d);
  }, [currentDate, maxFutureDate, saveDate]);

  const goToday = useCallback(() => saveDate(today), [saveDate, today]);

  const { activities, addActivity, updateActivity, removeActivity } = useActivities();
  const statusActivities = useActivitiesWithStatus(currentDate);
  const todayKey = formatDateKey(today);
  const isFuture = formatDateKey(currentDate) > todayKey;

  const handleToggle = (id: string) => {
    window.dispatchEvent(new CustomEvent('pulseboard-toggle', { detail: { activityId: id } }));
  };

  const handleEdit = (id: string, name: string, description: string | undefined, category: string, dailyGoal?: number) => {
    updateActivity(id, name, description, category, dailyGoal);
  };

  const handleDelete = (id: string) => {
    removeActivity(id);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>PulseBoard</h1>
        <p>Täglicher Begleiter</p>
      </header>

      <main className="app-main">
        <Dashboard activities={statusActivities} date={currentDate} />

        <DayNavigation
          currentDate={currentDate}
          onPrev={goPrev}
          onNext={goNext}
          onToday={goToday}
          maxDate={maxFutureDate}
        />

        {activities.length === 0 ? (
          <EmptyState
            message="Dein PulseBoard ist leer."
            sub="Füge deine erste Aktivität oder Gewohnheit hinzu."
          />
        ) : (
          <ActivityList
            activities={statusActivities}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            categories={CATEGORIES}
            onAdd={addActivity}
            isFuture={isFuture}
          />
        )}
      </main>
    </div>
  );
}
