type Tab = 'today' | 'week' | 'settings'

interface Props {
  active: Tab
  onTabChange: (tab: Tab) => void
}

export default function BottomNav({ active, onTabChange }: Props) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Heute', icon: <TodayIcon /> },
    { id: 'week', label: 'Woche', icon: <WeekIcon /> },
    { id: 'settings', label: 'Einstellungen', icon: <SettingsIcon /> },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-t border-stone-200 dark:border-stone-800">
      <div className="max-w-md mx-auto flex">
        {tabs.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 min-h-[48px] touch-manipulation"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={`transition-colors duration-150 ${isActive ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400 dark:text-stone-500'}`}>
                {tab.icon}
              </span>
              <span className={`text-xs transition-colors duration-150 ${isActive ? 'text-stone-900 dark:text-stone-100 font-medium' : 'text-stone-400 dark:text-stone-500'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function TodayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function WeekIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
