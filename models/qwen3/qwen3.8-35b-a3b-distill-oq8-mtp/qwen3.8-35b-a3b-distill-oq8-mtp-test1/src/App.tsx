import { useState } from 'react';
import { load, save, getToday } from './lib/storage';
import { useDayData } from './hooks/useDayData';
import { Dashboard } from './components/Dashboard';
import { ActivitiesPanel } from './components/ActivitiesPanel';
import { ActivityForm } from './components/ActivityForm';
import { CategoryFilter } from './components/CategoryFilter';
import { DayNavigator } from './components/DayNavigator';
import type { Tab } from './types';

function App() {
  const [appData, setAppData] = useState(load);

  const [selectedDate, setSelectedDate] = useState(getToday);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('aktivitäten');
  const [formOpen, setFormOpen] = useState(false);

  const dayData = useDayData(appData, {
    selectedDate,
    selectedCategory,
    tab,
    onDateChange: setSelectedDate,
    onCategoryChange: setSelectedCategory,
    onTabChange: setTab,
  });

  const today = getToday();

  const handleToggleComplete = (activityId: string, completed: boolean) => {
    const newData = dayData.toggleComplete(activityId, completed);
    setAppData(newData);
    save(newData);
  };

  const handleDeleteActivity = (activityId: string) => {
    if (!window.confirm('Aktivität wirklich löschen?')) return;
    const newData = dayData.deleteActivity(activityId);
    setAppData(newData);
    save(newData);
  };

  const handleAddActivity = (activity: {
    id: string;
    name: string;
    description?: string;
    category: string;
    dailyTarget?: number;
    createdAt: number;
  }) => {
    const newData = {
      ...appData,
      activities: [...appData.activities, activity],
    };
    setAppData(newData);
    save(newData);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <span className="title-bar" />
          <h1>PulseBoard</h1>
        </div>
        <div className="app-tabs">
          <button
            className={`tab-btn${tab === 'aktivitäten' ? ' active' : ''}`}
            onClick={() => setTab('aktivitäten')}
          >
            Aktivitäten
          </button>
          <button
            className={`tab-btn${tab === 'dashboard' ? ' active' : ''}`}
            onClick={() => setTab('dashboard')}
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="app-main">
        {tab === 'aktivitäten' ? (
          <>
            <DayNavigator
              selectedDate={selectedDate}
              yesterday={dayData.yesterday}
              tomorrow={dayData.tomorrow}
              onNavigate={setSelectedDate}
              onToday={() => setSelectedDate(today)}
            />

            <div className="progress-bar-wrap">
              <div
                className="progress-bar"
                style={{ width: `${dayData.stats.percentage}%` }}
              />
            </div>

            <div className="stats-inline">
              <span>
                {dayData.stats.completed} von {dayData.activities.length}
              </span>
              <span>{dayData.stats.percentage}%</span>
            </div>

            <CategoryFilter
              categories={dayData.categories}
              selectedCategory={dayData.selectedCategory}
              onFilter={setSelectedCategory}
            />

            <ActivitiesPanel
              activities={dayData.activities}
              isFuture={dayData.isFuture}
              isToday={dayData.isToday}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteActivity}
            />

            <button
              className="fab"
              onClick={() => setFormOpen(true)}
              aria-label="Aktivität hinzufügen"
            >
              +
            </button>
          </>
        ) : (
          <Dashboard
            activities={dayData.activities}
            categoryStats={dayData.categoryStats}
          />
        )}
      </main>

      {formOpen && (
        <div className="modal-overlay" onClick={() => setFormOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <ActivityForm
              categories={dayData.categories}
              existingNames={appData.activities.map((a) => a.name.toLowerCase())}
              onSubmit={handleAddActivity}
              onClose={() => setFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
