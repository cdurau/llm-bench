import { useState, useEffect } from 'react';
import { IconPlus, IconPencil, IconTrash } from '../icons';
import {
  getHabits,
  addHabit,
  updateHabit,
  deleteHabit,
  getDarkMode,
  setDarkMode,
} from '../lib/db';
import type { Habit, DarkMode } from '../lib/types';

const PRESET_COLORS = [
  '#e74c3c',
  '#e67e22',
  '#f1c40f',
  '#2ecc71',
  '#1abc9c',
  '#3498db',
  '#9b59b6',
  '#6c5ce7',
  '#fd79a8',
];

const PRESET_ICONS = [
  '💧',
  '📖',
  '🏃',
  '🧘',
  '✍️',
  '🎨',
  '🎵',
  '🍳',
  '💊',
  '🧹',
  '🛁',
  '👟',
  '💪',
  '📷',
  '🧠',
  '💡',
];

export function Settings() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [darkMode, setDarkModeState] = useState<DarkMode>('system');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [newIcon, setNewIcon] = useState(PRESET_ICONS[0]);

  useEffect(() => {
    (async () => {
      const h = await getHabits();
      const dm = await getDarkMode();
      setHabits(h);
      setDarkModeState(dm);
    })();
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    const id = await addHabit({
      name: newName.trim(),
      color: newColor,
      icon: newIcon,
    });
    setHabits((prev) => [...prev, { id, name: newName.trim(), color: newColor, icon: newIcon, createdAt: Date.now() }]);
    setShowForm(false);
    setNewName('');
  }

  async function handleEdit(habitId: string) {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    await updateHabit(habitId, { name: editName.trim(), color: newColor, icon: newIcon });
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, name: editName.trim(), color: newColor, icon: newIcon } : h
      )
    );
    setEditing(null);
  }

  async function handleDelete(habitId: string) {
    await deleteHabit(habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  }

  async function toggleDarkMode() {
    const next: DarkMode =
      darkMode === 'system' ? 'light' : darkMode === 'light' ? 'dark' : 'system';
    await setDarkMode(next);
  }

  return (
    <div className="max-w-md mx-auto px-5 py-6">
      <h2 className="text-base mb-5">Einstellungen</h2>

      {/* Dark mode */}
      <div className="mb-8">
        <h3 className="text-xs uppercase tracking-[0.08em] text-neutral-500 mb-2">
          Anzeige
        </h3>
        <button
          onClick={toggleDarkMode}
          className="px-4 py-3 rounded-xl text-left text-[15px] w-full transition
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400"
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e7e5e4',
          }}
        >
          {darkMode === 'system'
            ? 'System-Richtlinien folgen'
            : darkMode === 'light'
            ? 'Heller Modus'
            : 'Dunkler Modus'}
        </button>
      </div>

      {/* Habits list */}
      <div className="mb-6">
        <h3 className="text-xs uppercase tracking-[0.08em] text-neutral-500 mb-2">
          Meine Habits
        </h3>
        {habits.length === 0 ? (
          <p className="text-sm text-neutral-400">
            Erstelle deinen ersten Habit.
          </p>
        ) : (
          <div className="space-y-2">
            {habits.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ backgroundColor: '#fff', border: `1px solid ${h.color}22` }}
              >
                <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ backgroundColor: h.color + '22', color: h.color }}>
                  {h.icon}
                </span>
                {editing === h.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-[14px] flex-1 px-2"
                    autoFocus
                    onBlur={() => handleEdit(h.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEdit(h.id);
                    }}
                  />
                ) : (
                  <span className="text-[14px] flex-1">{h.name}</span>
                )}
                {editing === h.id ? (
                  <button
                    className="p-2"
                    onClick={() => setEditing(null)}
                  >
                    <span className="text-neutral-400 text-[13px]">OK</span>
                  </button>
                ) : (
                  <button
                    className="p-2"
                    onClick={() => {
                      setEditing(h.id);
                      setEditName(h.name);
                      setNewColor(h.color);
                      setNewIcon(h.icon);
                    }}
                    aria-label="Editieren"
                  >
                    <IconPencil size={15} />
                  </button>
                )}
                <button
                  className="p-2"
                  onClick={() => handleDelete(h.id)}
                  aria-label="Löschen"
                >
                  <IconTrash size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add form */}
      {showForm ? (
        <form onSubmit={handleCreate} className="space-y-4 mb-6">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Habit-Name"
            className="w-full px-4 py-3 rounded-xl text-[15px] outline-none"
            style={{ backgroundColor: '#fff', border: '1px solid #e7e5e4' }}
            autoFocus
          />
          <div>
            <p className="text-xs text-neutral-500 mb-1.5">Farbe</p>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-8 h-8 rounded-lg transition`}
                  style={{ backgroundColor: c, outline: newColor === c ? `2px solid ${c}` : undefined }}
                  onClick={() => setNewColor(c)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1.5">Symbol</p>
            <div className="flex gap-2 flex-wrap">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className="w-8 h-8 rounded-lg text-[13px] flex items-center justify-center"
                  style={{
                    backgroundColor: newIcon === icon ? '#f5f5f4' : '#fff',
                    border: newIcon === icon ? '1px solid #d6d3d1' : '1px solid transparent',
                  }}
                  onClick={() => setNewIcon(icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl text-[15px] font-medium"
              style={{ backgroundColor: '#1c1917', color: '#fff' }}
            >
              Erstellen
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-3 rounded-xl text-[15px]"
              style={{ backgroundColor: '#f5f5f4' }}
            >
              Abbrechen
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3.5 rounded-2xl text-left text-[15px] flex items-center gap-3"
          style={{ backgroundColor: '#fff', border: '1px solid #e7e5e4', borderColor: '#d6d3d1' }}
        >
          <IconPlus size={18} />
          Neuen Habit erstellen
        </button>
      )}
    </div>
  );
}
