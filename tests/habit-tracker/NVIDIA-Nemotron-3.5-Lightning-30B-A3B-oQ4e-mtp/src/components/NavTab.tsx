import React from 'react'

interface NavTabProps {
  active: 'today' | 'week' | 'settings'
  onClick: (tab: 'today' | 'week' | 'settings') => void
}

export const NavTab: React.FC<NavTabProps> = ({ active, onClick }) => {
  return (
    <div className="flex gap-2 justify-center pt-2">
      <button
        className={`px-4 py-2 rounded-lg transition-all ${
          active === 'today'
            ? 'bg-primary text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        onClick={() => onClick('today')}
        data-testid="nav-today"
      >
        Heute
      </button>
      <button
        className={`px-4 py-2 rounded-lg transition-all ${
          active === 'week'
            ? 'bg-primary text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        onClick={() => onClick('week')}
        data-testid="nav-week"
      >
        Woche
      </button>
      <button
        className={`px-4 py-2 rounded-lg transition-all ${
          active === 'settings'
            ? 'bg-primary text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        onClick={() => onClick('settings')}
        data-testid="nav-settings"
      >
        Einstellungen
      </button>
    </div>
  )
}