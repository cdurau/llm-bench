import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Activity } from '@/types';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';

interface EditActivityFormProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
}

export function EditActivityForm({ activity, isOpen, onClose }: EditActivityFormProps) {
  const { updateActivity } = useApp();
  
  const [name, setName] = useState(activity.name);
  const [description, setDescription] = useState(activity.description || '');
  const [category, setCategory] = useState(activity.category);
  const [dailyTarget, setDailyTarget] = useState<string>(
    activity.dailyTarget?.toString() || ''
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    updateActivity(activity.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      category: category.trim() || 'Allgemein',
      dailyTarget: dailyTarget ? parseFloat(dailyTarget) : undefined
    });
    
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aktivität bearbeiten">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Beschreibung
          </label>
          
          <textarea
            className="w-full px-3 py-2 border rounded-lg transition-colors bg-white dark:bg-slate-800
              border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500
              text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Kategorie
            </label>
            
            <select
              className="w-full px-3 py-2 border rounded-lg transition-colors bg-white dark:bg-slate-800
                border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500
                text-gray-900 dark:text-white focus:outline-none focus:ring-2 appearance-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Bitte wählen...</option>
              <option value="Gesundheit">Gesundheit</option>
              <option value="Arbeit">Arbeit</option>
              <option value="Lernen">Lernen</option>
              <option value="Hausarbeit">Hausarbeit</option>
              <option value="Freizeit">Freizeit</option>
              <option value="Andere">Andere</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tagesziel
            </label>
            
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                className="w-full px-3 py-2 border rounded-lg transition-colors bg-white dark:bg-slate-800
                  border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500
                  text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(e.target.value)}
              />
              
              <span className="absolute right-3 top-2.5 text-gray-400">Mal</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Abbrechen
          </Button>
          
          <Button type="submit" className="flex-1">
            Speichern
          </Button>
        </div>
      </form>
    </Modal>
  );
}
