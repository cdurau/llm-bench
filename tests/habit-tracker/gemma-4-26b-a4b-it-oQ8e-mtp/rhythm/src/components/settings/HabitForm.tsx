import { useState } from 'react';
import { type Habit } from '../../lib/db';

interface HabitFormProps {
  habit?: Habit;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const EMOJIS = ['✨', '🌱', '🔥', '🌊', '☀️', '🌙', '🍎', '💪', '🧘', '📚', '🎨', '🎵', '🍕', '🏃', '😴'];
const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
  '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', 
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

const HabitForm: React.FC<HabitFormProps> = ({ habit, onSave, onCancel }) => {
  const [name, setName] = useState(habit?.name || '');
  const [emoji, setEmoji] = useState(habit?.emoji || '✨');
  const [color, setColor] = useState(habit?.color || '#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, emoji, color });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
        <h2 className="text-xl font-bold">{habit ? 'Habit bearbeiten' : 'Neues Habit anlegen'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-[var(--text-muted)]">Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Wasser trinken"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--text-muted)]">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-lg transition-colors ${emoji === e ? 'bg-[var(--accent-bg)] ring-2 ring-[var(--accent)]' : 'hover:bg-[var(--border)]'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--text-muted)]">Farbe</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-[var(--accent)]' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-medium border border-[var(--border)]"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl font-medium btn-primary"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitForm;
