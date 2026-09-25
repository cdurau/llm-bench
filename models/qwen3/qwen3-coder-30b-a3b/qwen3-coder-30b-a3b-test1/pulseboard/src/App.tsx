import React, { useState, useEffect } from 'react';
import './styles/index.css';

const App: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [newActivityName, setNewActivityName] = useState<string>('');

  // Load data from localStorage on app start
  useEffect(() => {
    const savedData = localStorage.getItem('pulseboard-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setActivities(parsed.activities || []);
      } catch (error) {
        console.error('Failed to parse saved data:', error);
        setActivities([]);
      }
    }
  }, []);

  // Save data to localStorage whenever activities change
  useEffect(() => {
    const dataToSave = {
      version: '1.0',
      activities,
    };
    localStorage.setItem('pulseboard-data', JSON.stringify(dataToSave));
  }, [activities]);

  const addActivity = (name: string) => {
    const newActivity = {
      id: Date.now().toString(),
      name,
      completed: false,
    };
    setActivities([...activities, newActivity]);
  };

  const updateActivity = (id: string, updates: any) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...activity, ...updates } : activity
    ));
  };

  const toggleActivity = (id: string) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...activity, completed: !activity.completed } : activity
    ));
  };

  const handleAddActivity = () => {
    if (newActivityName.trim()) {
      addActivity(newActivityName);
      setNewActivityName('');
    }
  };

  const handleDelete = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  const handleEdit = (id: string, newName: string) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...{...activity, name: newName } } : activity
    ));
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}'}>
      <div className="app-container">
        <header className="header">
          <div className="header-content">
            <h1 className="appTitle">PulseBoard</h1>
            <div className="header-actions">
              <button 
                className="toggle-dark-mode"
                onClick={() => setDarkMode(!darkMode)}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
>
                {darkMode ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
          <div className="add-activity">
            <input
              type="text"
              value={newActivityName}
  onChange={(e) => setNewActivityName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddActivity();
                }
              }}
              placeholder="Add new activity"
              className="activity-input"
            />
            <button 
              onClick={handleAddActivity}
              className="add-button"
              aria-label="Add activity"
>
                + Add
</button>
          </div>
        </header>

        <main className="main-content">
          <div className="dashboard">
            <div className="dashboard-content">
              <div className="progress-container">
                <h2>Today's Progress</h2>
                <div className="progress-info">
                  <span className="completed-count">{activities.filter(a => a.completed).length}/{activities.length}</span>
                  <span className="progress-percentage">
                    {activities.length > 0 ? Math.round((activities.filter(a => a.completed).length / activities.length) * 100) : 0}% 
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${activities.length > 0 ? Math.round((activities.filter(a => a.completed).length / activities.length) * 100) : 0}%` }}
>
                  </div>
                </div>
              </div>
              
              <div className="category-stats">
                <h3>By Category</h3>
                {Object.entries(activities.reduce((acc, activity) => {
                  const category = activity.category || 'uncategorized';
                  acc[category] = acc[category] ? acc[category] + 1 : 1;
                  return acc;
                }, {} as Record<string, number>)).map(([category, count]) => (
                  <div key={category} className="category-stat">
                    <span className="category-name">{category}</span>
                    <span className="category-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="activity-list">
            {activities.length === 0 ? (
              <div className="empty-state">
                <p>No activities added yet. Add some activities to get started!</p>
              </div>
            ) : (
              <ul className="activity-list">
                {activities.map(activity => (
                  <li key={activity.id} className="activity-item">
                    <div className="activity-item-content">
                    <div className="activity-checkbox">
                    <div className="activity-checkbox">
                    <div className="activity-checkbox">
                    <div className="activity-checkbox">
                    <div className="activity-checkbox">
                    <div className="activity-checkbox">
                    <div className="activity-checkbox">
                    <div className="activity-checkbox">
                    <div className="activity-checkbox">
                    <div className="activity-checkbox">
                    <div className="activity-checkbox">
                    <div className="activity-checkbox">
                    <div className="activity-checkbox">
                    <div className="activity-checkbox">
      <div className="activity-checkbox">
        <input 
          type="checkbox" 
          checked={activity.completed || false}
          onChange={() => toggleActivity(activity.id)}
          className="checkbox"
        />
      </div>
      <div className="activity-content">
        <span className={activity.completed ? "completed" : ""}>
          {activity.name}
        </span>
      </div>
      <div className="activity-actions">
        <button 
          onClick={() => toggleActivity(activity.id)}
          className="toggle-button"
          aria-label={activity.completed ? "Mark as incomplete" : "Mark as complete"}
>
          ✓
</button>
        <button 
          onClick={() => {
            const newName = prompt("Edit activity:", activity.name);
            if (newName !== null && newName.trim() !== "") {
              handleEdit(activity.id, newName);
            }
          }}
          className="edit-button"
          aria-label="Edit activity"
>
          Edit
</button>
        <button 
          onClick={() => handleDelete(activity.id)}
          className="delete-button"
          aria-label="Delete activity"
>
          Delete
</button>
      </div>
    </div>
                </li>
              ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;