import {} from 'react'

type Tab = 'today' | 'week' | 'settings'

interface BottomNavProps {
  activeTab: Tab
  onChange: (tab: Tab) => void
}

const tabs = [
  { id: 'today' as const, label: 'Heute', icon: '📅' },
  { id: 'week' as const, label: 'Woche', icon: '📊' },
  { id: 'settings' as const, label: 'Einstellungen', icon: '⚙️' },
] as const

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-md mx-auto px-6 py-2">
        <ul className="flex justify-around">
          {tabs.map(tab => (
            <li key={tab.id}>
              <button
                onClick={() => onChange(tab.id)}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                aria-label={tab.label}
              >
                <span className="text-2xl">{tab.icon}</span>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
