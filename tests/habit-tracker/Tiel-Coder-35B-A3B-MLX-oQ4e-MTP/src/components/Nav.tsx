import type { Tab } from '../App.tsx';

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Heute' },
  { id: 'week', label: 'Woche' },
  { id: 'settings', label: 'Einstellungen' },
];

export function Nav({ active, onNavigate }: { active: Tab; onNavigate: (t: Tab) => void }) {
  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-30 border-t"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--edge)',
      }}
      aria-label="Hauptnavigation"
    >
      <div className="mx-auto w-full max-w-[360px] grid grid-cols-3 h-16">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              data-testid={`nav-${tab.id}`}
              onClick={() => onNavigate(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className="group flex h-full w-full flex-col items-center justify-center gap-1 border-b-2 px-2 transition-colors"
              style={{
                borderColor: isActive ? 'var(--accent-strong)' : 'transparent',
                color: isActive ? 'var(--ink)' : 'var(--ink-muted)',
              }}
            >
              <span className="text-[15px] font-medium tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
