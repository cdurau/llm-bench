import React, { useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { Activity } from '../types';
import { Plus, X, Save, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activityToEdit?: Activity | null;
}

export const ActivityModal: React.FC<Props> = ({ isOpen, onClose, activityToEdit }) => {
  const { addActivity, updateActivity } = usePulse();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [dailyGoal, setDailyGoal] = useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (activityToEdit) {
      setName(activityToEdit.name);
      setDescription(activityToEdit.description || '');
      setCategory(activityToEdit.category);
      setDailyGoal(activityToEdit.dailyGoal);
    } else {
      setName('');
      setDescription('');
      setCategory('General');
      setDailyGoal(undefined);
    }
  }, [activityToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (activityToEdit) {
      updateActivity(activityToEdit.id, { name, description, category, dailyGoal });
    } else {
      addActivity({ name, description, category, dailyGoal });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md border border-stone-200 dark:border-stone-800 p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif text-stone-900 dark:text-stone-100">
            {activityToEdit ? 'Edit Activity' : 'New Activity'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
            <X size={20} className="text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Name</label>
            <input 
              autoFocus
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 bg-transparent rounded-sm focus:ring-1 focus:ring-olive-600 outline-none dark:text-stone-200"
              placeholder="e.g., Morning Meditation"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Description (optional)</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 bg-transparent rounded-sm focus:ring-1 focus:ring-olive-600 outline-none dark:text-stone-200"
              placeholder="Why is this important?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Category</label>
              <input 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 bg-transparent rounded-sm focus:ring-1 focus:ring-olive-600 outline-none dark:text-stone-200"
                placeholder="e.g., Wellness"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Daily Goal (optional)</label>
              <input 
                type="number"
                value={dailyGoal || ''} 
                onChange={e => setDailyGoal(parseInt(e.target.value) || undefined)} 
                className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 bg-transparent rounded-sm focus:ring-1 focus:ring-olive-600 outline-none dark:text-stone-200"
                placeholder="1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Save size={16} />
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
