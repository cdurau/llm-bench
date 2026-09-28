import { useState, useMemo } from 'react';
import { useActivities } from './hooks/useActivities';
import { useDayProgress } from './hooks/useDayProgress';
import { ActivityForm } from './components/ActivityForm';
import { ActivityItem } from './components/ActivityItem';
import { Dashboard } from './components/Dashboard';
import { DateNavigator } from './components/DateNavigator';
import { Modal } from './components/Modal';
import { CATEGORY_LABELS } from './types';
import './App.css';

function App() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [editingActivity, setEditingActivity] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { activities, addActivity, updateActivity, deleteActivity } = useActivities();
  const { completedIds, toggleCompletion, isCompleted } = useDayProgress(
    currentDate.toISOString().split('T')[0]
  );

  const filteredActivities = useMemo(() => {
    return activities.filter(a => !completedIds.has(a.id));
  }, [activities, completedIds]);

  const completedActivities = useMemo(() => {
    return activities.filter(a => completedIds.has(a.id));
  }, [activities, completedIds]);

  const handleAddActivity = (activityData) => {
    addActivity(activityData);
    setShowAddModal(false);
  };

  const handleUpdateActivity = (activityData) => {
    if (editingActivity) {
      updateActivity(editingActivity.id, activityData);
      setEditingActivity(null);
    }
  };

  const handleDeleteActivity = (id) => {
    return deleteActivity(id);
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setEditingActivity(null);
    setShowAddModal(false);
  };

  const today = useMemo(() => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return currentDate.getTime() === todayDate.getTime();
  }, [currentDate]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>PulseBoard</h1>
        <p className="app-subtitle">Deine Tagesübersicht</p>
      </header>

      <main className="app-main">
        <DateNavigator 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />

        <Dashboard
          activities={activities}
          completedCount={completedIds.size}
          totalCount={activities.length}
        />

        <section className="activity-section" aria-labelledby="activities-heading">
          <h2 id="activities-heading">
            {today ? 'Heute' : currentDate.toLocaleDateString('de-DE', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
            {' '}{activities.length > 0 ? '' : ''}
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="add-btn"
              aria-label="Neue Aktivität hinzufügen"
              title="Neue Aktivität hinzufügen"
            >
              +
            </button>
          </h2>

          {activities.length === 0 ? (
            <div className="empty-state">
              <p>Keine Aktivitäten hinzugefügt. Klicken Sie auf die + Schaltfläche, um eine neue Aktivität zu erstellen.</p>
            </div>
          ) : (
            <div className="activities-list" role="list">
              {filteredActivities.map(activity => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  isCompleted={isCompleted(activity.id)}
                  onToggle={toggleCompletion}
                  onEdit={handleEdit}
                  onDelete={handleDeleteActivity}
                />
              ))}
              
              {filteredActivities.length === 0 && completedIds.size > 0 && (
                <div className="empty-state">
                  <p>Alle Aktivitäten erledigt! 🎉</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Modal 
        isOpen={showAddModal}
        onClose={handleCloseModal}
        title={editingActivity ? 'Aktivität bearbeiten' : 'Neue Aktivität'}
      >
        <ActivityForm
          activity={editingActivity}
          onSubmit={editingActivity 
            ? handleUpdateActivity 
            : handleAddActivity
          }
          onCancel={handleCloseModal}
        />
      </Modal>

      <footer className="app-footer">
        <p>PulseBoard – Dein Tagesplaner</p>
      </footer>
    </div>
  );
}

export default App;