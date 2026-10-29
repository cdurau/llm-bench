import { IconHome, IconSettings, IconWeek } from './icons';
import type { TabId } from '../lib/types';

const TABS: ReadonlyArray<{ id: TabId; label: string; Icon: typeof IconHome }> = [
  { id: 'heute', label: 'Heute', Icon: IconHome },
  { id: 'woche', label: 'Woche', Icon: IconWeek },
  { id: 'einstellungen', label: 'Einstellungen', Icon: IconSettings },
];

interface BottomNavProps {
  tab: TabId;
  onChange: (tab: TabId) => void;
}

export default function BottomNav({ tab, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-canvas pb-[env(safe-area-inset-bottom)]"
      aria-label="Hauptnavigation"
    >
      <div className="mx-auto flex w-full max-w-md">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                active ? 'text-ink' : 'text-muted'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}