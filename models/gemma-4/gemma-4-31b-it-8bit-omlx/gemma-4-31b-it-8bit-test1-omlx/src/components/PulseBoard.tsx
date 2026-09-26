import React from 'react';
import { usePulse } from '../context/PulseContext';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2 } from 'lucide-react';
import { format, addDays, subDays, isToday, isAfter } from 'date-fns';
import { ActivityModal } from './ActivityModal';
import { useState } from 'react';
import { Activity } from '../types';

export const PulseBoard: React.FC = () => {
  const { 
    currentDate, 
    setCurrentDate, 
    activities, 
    toggleActivity, 
    isActivityCompleted, 
    deleteActivity 
  } = usePulse();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const openAddModal = () => {
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const openEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const handleToggle = (id: string) => {
    const currentlyCompleted = isActivityCompleted(id);
    // Prevent checking future dates
    if (!currentlyCompleted && isAfter(currentDate, new Date())) {
      return;
    }
    toggleActivity(id, !currentlyCompleted);
  };

  const completedCount = activities.filter(a => isActivityCompleted(a.id)).length;
  const progress = activities.length > 0 ? (completedCount / activities.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#1A1A1C] text-stone-900 dark:text-stone-100 transition-colors duration-300 flex justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl">
        
        {/* Header */}
        <header className="flex flex-col gap-6 mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentDate(subDays(currentDate, 1))}
                className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors"
                aria-label="Previous Day"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-3xl font-serif font-medium">
                {format(currentDate, 'EEEE, MMMM do')}
                {isToday(currentDate) && <span className="ml-3 text-sm font-sans uppercase tracking-widest text-olive-600 opacity-70">Today</span>}
              </h1>
              <button 
                onClick={() => setCurrentDate(addDays(currentDate, 1))}
                className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors"
                aria-label="Next Day"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            <button 
              onClick={openAddModal}
              className="p-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-full hover:opacity-90 transition-opacity"
              aria-label="Add Activity"
            >
              <Plus size={24} />
            </button>
          </div>

          {/* Pulse Meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-stone-500 uppercase tracking-wider">
              <span>Daily Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-olive-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-stone-400">
              <span>{completedCount} completed</span>
              <span>{activities.length - completedCount} remaining</span>
            </div>
          </div>
        </header>

        {/* Activities List */}
        <main className="space-y-1">
          {activities.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <p className="text-stone-400 font-serif italic">No activities defined yet.</p>
              <button 
                onClick={openAddModal}
                className="text-sm text-olive-600 hover:underline underline-offset-4"
              >
                Start by adding your first activity
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-200 dark:divide-stone-800">
              {activities.map(activity => (
                <div 
                  key={activity.id} 
                  className={`group flex items-center justify-between py-4 transition-opacity ${isActivityCompleted(activity.id) ? 'opacity-50' : 'opacity-100'}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button 
                      onClick={() => handleToggle(activity.id)}
                      className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                        isActivityCompleted(activity.id) 
                        ? 'bg-olive-600 border-olive-600 text-white' 
                        : 'border-stone-300 dark:border-stone-700 hover:border-olive-600'
                      }`}
                      aria-label="Toggle completion"
                    >
                      {isActivityCompleted(activity.id) && <span className="text-xs">✓</span>}
                    </button>
                    <div className="flex flex-col">
                      <span className={`text-lg transition-colors ${isActivityCompleted(activity.id) ? 'line-through text-stone-400' : ''}`}>
                        {activity.name}
                      </span>
                      {activity.description && (
                        <span className="text-xs text-stone-500 line-clamp-1">{activity.description}</span>
                      )}
                      <span className="text-[10px] uppercase tracking-tighter text-stone-400 mt-1">
                        {activity.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(activity)}
                      className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                      aria-label="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Delete this activity?')) deleteActivity(activity.id);
                      }}
                      className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <ActivityModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          activityToEdit={editingActivity} 
        />
      </div>
    </div>
  );
};
