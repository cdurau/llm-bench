import React from 'react';
import { Activity } from '../types';

interface DashboardProps {
  activities: Activity[];
  currentDate: string;
  darkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ activities, currentDate, darkMode }) => {
  const completedActivities = activities.filter(activity => activity.completed).length;
  const totalActivities = activities.length;
  const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  const getCategoriesWithStats = () => {
    const categories: Record<string, { count: number; completed: number }> = {};
    
    activities.forEach(activity => {
      const category = activity.category || 'uncategorized';
      if (categories[category]) {
        categories[category].count += 1;
        if (activity.completed) {
          categories[category].completed += 1;
        }
      } else {
        categories[category] = {
          count: 1,
          completed: activity.completed ? 1 : 0
        };
      }
    });
    
    return categories;
  };

  const categoryStats = getCategoriesWithStats();

  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
      <div className="dashboard-content">
        <div className="progress-container">
          <h2>Today's Progress</h2>
          <div className="progress-info">
            <span className="completed-count">{completedActivities}/{totalActivities}</span>
            <span className="progress-percentage">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="category-stats">
          <h3>By Category</h3>
          {Object.entries(categoryStats).map(([category, stats]) => (
            <div key={category} className="category-stat">
              <span className="category-name">{category}</span>
              <span className="category-count">{stats.completed}/{stats.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;