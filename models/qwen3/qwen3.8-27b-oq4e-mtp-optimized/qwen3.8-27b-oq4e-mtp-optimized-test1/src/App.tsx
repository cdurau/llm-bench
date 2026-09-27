import { useMemo, useState } from 'react';
import type { Activity } from './lib/types';
import { NO_CATEGORY } from './lib/types';
import { AppProvider } from './state/Provider';
import { useApp } from './state/useApp';
import { categoryStats, statsForDay } from './state/store';
import { useSelectedDay } from './hooks/useSelectedDay';
import { DayHeader } from './components/DayHeader';
import { ActivityList } from './components/ActivityList';
import { ActivityDialog } from './components/ActivityDialog';
import type { ActivityDraft } from './components/activity-draft';
import { CategoryOverview } from './components/CategoryOverview';
import { Banner } from './components/Banner';
import { PwaUpdater } from './components/PwaUpdater';
import { IconPlus } from './components/icons';
import { ToastViewport } from './state/Toasts';

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

function Shell() {
  const { data, recovery, dispatch, dismissRecovery } = useApp();
  const [day, selectDay] = useSelectedDay();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  const stats = useMemo(() => statsForDay(data, day), [data, day]);
  const categories = useMemo(() => categoryStats(data, day), [data, day]);
  const knownCategories = useMemo(
    () => [...new Set(data.activities.map((a) => a.category))],
    [data.activities],
  );

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(activity: Activity) {
    setEditing(activity);
    setDialogOpen(true);
  }

  function handleSubmit(draft: ActivityDraft) {
    const category = draft.category === '' ? NO_CATEGORY : draft.category;
    const target = draft.target ?? 1;
    const fields = {
      name: draft.name,
      description: draft.description,
      category,
      target,
    };
    if (editing) {
      dispatch({ type: 'activity/update', id: editing.id, patch: fields });
    } else {
      dispatch({ type: 'activity/add', activity: fields });
    }
    setDialogOpen(false);
    setEditing(null);
  }

  return (
    <div className="shell">
      <header className="topbar">
        <span className="wordmark">PulseBoard</span>
      </header>

      <main>
        {recovery === 'corrupt' && (
          <Banner tone="danger" onDismiss={dismissRecovery}>
            Gespeicherte Daten konnten nicht gelesen werden – sie waren beschädigt.
            PulseBoard startet mit einem leeren Zustand; der alte Stand wird erst
            ersetzt, wenn du etwas speicherst.
          </Banner>
        )}

        <DayHeader day={day} stats={stats} onSelectDay={selectDay} />

        <ActivityList
          data={data}
          day={day}
          onToggle={(activity) => dispatch({ type: 'progress/toggle', date: day, id: activity.id })}
          onDecrement={(activity) =>
            dispatch({ type: 'progress/decrement', date: day, id: activity.id })
          }
          onEdit={openEdit}
          onDelete={(activity) => dispatch({ type: 'activity/delete', id: activity.id })}
          onAdd={openAdd}
        />

        {data.activities.length > 0 && (
          <div className="addrow">
            <button type="button" className="btn btn--primary" onClick={openAdd}>
              <IconPlus />
              Aktivität hinzufügen
            </button>
          </div>
        )}

        <CategoryOverview stats={categories} />
      </main>

      <ActivityDialog
        open={dialogOpen}
        activity={editing}
        categories={knownCategories}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ToastViewport />
      <PwaUpdater />
    </div>
  );
}
