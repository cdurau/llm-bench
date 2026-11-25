// --- Bottom navigation: Heute / Woche / Einstellungen ---

import { IconChart, IconCog, IconHome } from './Icons';

export type Tab = 'today' | 'week' | 'settings';

interface Props {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; Icon: typeof IconHome }[] = [
  { id: 'today', label: 'Heute', Icon: IconHome },
  { id: 'week', label: 'Woche', Icon: IconChart },
  { id: 'settings', label: 'Einstellungen', Icon: IconCog },
];

export function BottomNav({ tab, onTabChange }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-sm border-t border-border sm:max-w-md sm:mx-auto">
      <div className="flex items-center h-16">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[52px] text-xs font-medium transition-colors ${
              tab === id ? 'text-accent-text' : 'text-ink-faint hover:text-ink-muted'
            }`}
            aria-label={label}
            aria-current={tab === id ? 'page' : undefined}
          >
            <Icon className="w-6 h-6" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
