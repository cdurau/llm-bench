import React, { useState } from 'react';
import { format, isSameDay, isAfter, startOfDay } from 'date-fns';
import { useStorage } from './hooks/useStorage';
import { AppState, Activity } from './types';
import { Dashboard } from './components/Dashboard';
import { DateNavigation } from './components/DateNavigation';
import { ActivityForm } from './components/ActivityForm';
import { ActivityList } from './components/ActivityList';
import { Plus } from 'lucide-react';

function App() {
  const { state, saveState } = useStorage();
  const [currentDate, setCurrentDate] = useState<Date>(startOfDay(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Partial<Activity> | null>(null);

  const todayKey = currentDate.toISOString().split('T')[0];
  const isFutureDay = isAfter(currentDate, startOfDay(new Date()));

  const dayStatus = state.dailyStatuses[todayKey] || {
    completedActivityIds: [],
    completedValues: {},
  };

  const handleSaveActivity = (activity: Activity) => {
    const newActivities = [...state.activities];
    const existingIndex = newActivities.findIndex(a => a.id === activity.id);
    
    if (existingIndex > -1) {
      newActivities[existingIndex] = activity;
    } else {
      newActivities.push(activity);
    }
    
    saveState({ ...state, activities: newActivities });
    setIsModalOpen(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = (id: string) => {
    if (window.confirm('Are you sure you want to delete this activity? This will also remove all its progress data.')) {
      const newActivities = state.activities.filter(a => a.id !== id);
      const newDailyStatuses = { ...state.dailyStatuses };
      
      Object.keys(newDailyStatuses).forEach(dateKey => {
        if (newDailyStatuses[dateKey]) {
          newDailyStatuses[dateKey].completedActivityIds = newDailyStatuses[dateKey].completedActivityIds.filter(aid => aid !== id);
        }
      });
      
      saveState({ ...state, activities: newActivities, dailyStatuses: newDailyStatuses });
    }
  };

  const handleToggleActivity = (id: string) => {
    if (isFutureDay) return;

    const newDailyStatuses = { ...state.dailyStatuses };
    const status = { ...dayStatus };
    
    const index = status.completedActivityIds.indexOf(id);
    if (index > -1) {
      status.completedActivityIds.splice(index, 1);
    } else {
      status.completedActivityIds.push(id);
    }
    
    newDailyStatuses[todayKey] = status;
    saveState({ ...state, dailyStatuses: newDailyStatuses });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
            PulseBoard
          </h1>
        </header>

        <Dashboard state={state} currentDate={currentDate} />

        <DateNavigation 
          currentDate={currentDate} 
          onDateChange={setCurrentDate} 
        />

        <div className="mt-8 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {isSameDay(currentDate, new Date()) ? "Today's Activities" : format(currentDate, "MMMM dd, yyyy")}
          </h2>
          <button
            onClick={() => {
              setEditingActivity(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>

        <div className="mt-4">
          <ActivityList
            activities={state.activities}
            dayStatus={dayStatus}
            isFutureDay={isFutureDay}
            onToggle={handleToggleActivity}
            onEdit={(a) => {
              setEditingActivity(a);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteActivity}
          />
        </div>
      </div>

      {isModalOpen && (
        <ActivityForm
          initialData={editingActivity || undefined}
          onSave={handleSaveActivity}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingActivity(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
