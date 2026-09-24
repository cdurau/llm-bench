import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Activity } from '../types';
import { cn } from '../utils/helpers';

interface ActivityFormProps {
  onSave: (activity: Activity) => void;
  onCancel: () => void;
  initialData?: Partial<Activity>;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({ onSave, onCancel, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [targetValue, setTargetValue] = useState<string>(initialData?.targetValue?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;

    onSave({
      id: initialData?.id || crypto.randomUUID(),
      name,
      description,
      category,
      targetValue: targetValue ? parseFloat(targetValue) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {initialData ? 'Aktivität bearbeiten' : 'Neue Aktivität'}
          </h3>
          <button onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Sport treiben"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung (optional)</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Was genau möchtest du tun?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategorie</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="z.B. Gesundheit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tagesziel (optional)</label>
            <input
              type="number"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="z.B. 1"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-md"
          >
            Speichern
          </button>
        </form>
      </div>
    </div>
  );
};
