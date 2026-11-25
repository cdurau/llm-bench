import { useState } from 'react';
import type { Habit } from './types';
import { useHabits } from './useHabits';
import { useDarkMode } from './useDarkMode';
import * as db from './db';
import { notify } from './events';
import { TodayScreen } from './components/TodayScreen';
import { WeekScreen } from './components/WeekScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { HabitEditor } from './components/HabitEditor';
import { BottomNav } from './components/BottomNav';
import { IconPlus } from './components/Icons';

export default function App() {
  const { habits, addHabit, updateHabit, deleteHabit } = useHabits();
  const { preference, setPreference } = useDarkMode();
  const [tab, setTab] = useState<'today' | 'week' | 'settings'>('today');

  // Habit editor (add / edit)
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const openAdd = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = (h: Habit) => { setEditing(h); setEditorOpen(true); };
  const closeEditor = () => { setEditorOpen(false); setEditing(null); };

  const handleSave = (h: Omit<Habit, 'id'> & { id?: string }) => {
    if (h.id) {
      updateHabit(h as Habit);
    } else {
      addHabit(h);
    }
    closeEditor();
  };

  // Delete confirmation dialogs
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    title: string;
    description: string;
    confirmLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const openDelete = (habit: Habit) => {
    setConfirmOpen(true);
    setConfirmData({
      title: 'Habit löschen?',
      description: `"${habit.name}" und alle dazugehörigen Tage werden entfernt.`,
      confirmLabel: 'Löschen',
      danger: true,
      onConfirm: () => {
        deleteHabit(habit.id);
        setConfirmOpen(false);
        setConfirmData(null);
      },
    });
  };

  const openClearAll = () => {
    setConfirmOpen(true);
    setConfirmData({
      title: 'Alle Daten löschen?',
      description: 'Alle Habits, Tagebücher und Stimmungen werden endgültig entfernt.',
      confirmLabel: 'Alle löschen',
      danger: true,
      onConfirm: async () => {
        await db.clearAll();
        notify();
        setConfirmOpen(false);
        setConfirmData(null);
      },
    });
  };

  return (
    <div className="min-h-screen bg-base text-ink transition-colors">
      <div className="sm:max-w-md sm:mx-auto min-h-screen pb-20">
        <header className="px-5 pt-6 pb-2">
          <h1 className="text-3xl font-bold tracking-tight">Rhythm</h1>
        </header>

        {tab === 'today' && (
          <TodayScreen
            onAddHabit={openAdd}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        )}
        {tab === 'week' && <WeekScreen />}
        {tab === 'settings' && (
          <SettingsScreen
            preference={preference}
            setPreference={setPreference}
            habitCount={habits.length}
            onClearAll={openClearAll}
          />
        )}

        <BottomNav tab={tab} onTabChange={setTab} />

        {tab === 'today' && (
          <button
            onClick={openAdd}
            className="fixed right-5 bottom-20 w-14 h-14 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:brightness-110 active:scale-95 transition z-40"
            aria-label="Neues Habit anlegen"
          >
            <IconPlus className="w-6 h-6" />
          </button>
        )}

        <HabitEditor
          open={editorOpen}
          initial={editing}
          onSave={handleSave}
          onCancel={closeEditor}
        />

        {confirmOpen && confirmData && (
          <ConfirmDialog
            open={confirmOpen}
            title={confirmData.title}
            description={confirmData.description}
            confirmLabel={confirmData.confirmLabel}
            danger={confirmData.danger}
            onConfirm={confirmData.onConfirm}
            onCancel={() => { setConfirmOpen(false); setConfirmData(null); }}
          />
        )}
      </div>
    </div>
  );
}

function ConfirmDialog({ open, title, description, confirmLabel = 'Bestätigen', danger = false, onConfirm, onCancel }: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative w-full sm:max-w-md bg-surface rounded-t-2xl sm:rounded-lg p-6 mx-auto animate-scale-in">
        <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>
        <p className="text-sm text-ink-muted mb-6">{description}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-11 rounded-lg text-sm font-medium text-ink border border-border bg-surface-alt active:scale-[0.98] transition">Abbrechen</button>
          <button onClick={onConfirm} className={`flex-1 h-11 rounded-lg text-sm font-medium text-white ${danger ? 'bg-[#9F2F2D]' : 'bg-accent'} active:scale-[0.98] transition`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
