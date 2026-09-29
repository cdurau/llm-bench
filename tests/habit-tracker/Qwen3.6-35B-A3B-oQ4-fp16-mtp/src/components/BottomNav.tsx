import type { TabId } from '../types'

export default function BottomNav({
  active,
  onTabChange,
}: {
  active: TabId
  onTabChange: (tab: TabId) => void
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-[430px] mx-auto">
        <div className="
          flex items-center justify-around
          px-4 pb-6 pt-3
          border-t border-[#e8e7e3] dark:border-[#333333]
          bg-white/80 dark:bg-[#1a1a1a]/80
          backdrop-blur-lg
        ">
          <TabButton
            label="Heute"
            tabId="today"
            active={active}
            onClick={onTabChange}
            icon={<TodayIcon active={active === 'today'} />}
          />
          <TabButton
            label="Woche"
            tabId="week"
            active={active}
            onClick={onTabChange}
            icon={<WeekIcon active={active === 'week'} />}
          />
          <TabButton
            label="Mehr"
            tabId="settings"
            active={active}
            onClick={onTabChange}
            icon={<SettingsIcon active={active === 'settings'} />}
          />
        </div>
      </div>
    </nav>
  )
}

function TabButton({
  label,
  tabId,
  active,
  onClick,
  icon,
}: {
  label: string
  tabId: TabId
  active: TabId
  onClick: (tab: TabId) => void
  icon: React.ReactNode
}) {
  return (
    <button
      onClick={() => onClick(tabId)}
      className={`
        flex flex-col items-center gap-1 py-3 px-5
        focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] focus:ring-offset-2 rounded-lg
        transition-colors duration-200
        ${active
          ? 'text-[#2d5a3d] dark:text-[#3d7a54]'
          : 'text-[#8a8a8a] dark:text-[#9a9a9a] hover:text-[#555555] dark:hover:text-[#bbbbbb]'
        }
      `}
      aria-label={label}
      aria-current={active === tabId ? 'page' : undefined}
    >
      {icon}
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  )
}

function TodayIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="3" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 1v4M15 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {active ? (
        <path d="M7 10.5l2.5 2.5L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <line x1="7" y1="10.5" x2="15" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  )
}

function WeekIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="3" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="1.5" />
      {active ? (
        <>
          <rect x="5" y="11" width="2" height="4" rx="0.5" fill="currentColor" />
          <rect x="10" y="11" width="2" height="4" rx="0.5" fill="currentColor" />
          <rect x="15" y="11" width="2" height="4" rx="0.5" fill="currentColor" />
        </>
      ) : (
        <>
          <rect x="5" y="11" width="2" height="4" rx="0.5" stroke="currentColor" strokeWidth="1" />
          <rect x="10" y="11" width="2" height="4" rx="0.5" stroke="currentColor" strokeWidth="1" />
          <rect x="15" y="11" width="2" height="4" rx="0.5" stroke="currentColor" strokeWidth="1" />
        </>
      )}
    </svg>
  )
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      {active ? (
        <>
          <circle cx="11" cy="11" r="2" fill="currentColor" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <line
              key={angle}
              x1={11 + 6 * Math.cos((angle * Math.PI) / 180)}
              y1={11 + 6 * Math.sin((angle * Math.PI) / 180)}
              x2={11 + 8 * Math.cos((angle * Math.PI) / 180)}
              y2={11 + 8 * Math.sin((angle * Math.PI) / 180)}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}
        </>
      ) : (
        <>
          <circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <line
              key={angle}
              x1={11 + 6 * Math.cos((angle * Math.PI) / 180)}
              y1={11 + 6 * Math.sin((angle * Math.PI) / 180)}
              x2={11 + 8 * Math.cos((angle * Math.PI) / 180)}
              y2={11 + 8 * Math.sin((angle * Math.PI) / 180)}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}
        </>
      )}
    </svg>
  )
}
