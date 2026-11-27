import { Icon } from './ui';

export type Tab = 'today' | 'week' | 'settings';

const tabs: { id: Tab; label: string; icon: 'circleCheck' | 'chart' | 'sliders' }[] = [
  { id: 'today', label: 'Heute', icon: 'circleCheck' },
  { id: 'week', label: 'Woche', icon: 'chart' },
  { id: 'settings', label: 'Einstellungen', icon: 'sliders' }
];

export default function BottomNav({
  active,
  onChange
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-line bg-card/85 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-label={t.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onChange(t.id)}
              className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-ink' : 'text-faint hover:text-muted'
              }`}
            >
              <Icon name={t.icon} size={21} strokeWidth={isActive ? 2.6 : 2.1} />
              <span className={`text-[11px] tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {t.label}
              </span>
              <span
                className={`h-[3px] w-8 rounded-full transition-all ${
                  isActive ? 'bg-clay' : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
