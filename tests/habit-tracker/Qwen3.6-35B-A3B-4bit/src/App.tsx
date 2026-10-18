import { useState, useEffect } from 'react'
import { readTheme, systemDark, writeTheme } from './db'
import TodayScreen from './components/TodayScreen'
import WeekScreen from './components/WeekScreen'
import SettingsScreen from './components/SettingsScreen'

type Tab = 'today' | 'week' | 'settings'

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = readTheme()
    setThemeMode(stored || (systemDark() ? 'dark' : 'light'))
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const actual = themeMode === 'auto' ? (systemDark() ? 'dark' : 'light') : themeMode
    document.documentElement.classList.toggle('dark', actual === 'dark')
  }, [themeMode, mounted])

  const handleThemeOverride = (mode: 'light' | 'dark') => {
    writeTheme(mode)
    setThemeMode(mode)
  }

  return (
    <div className="h-dvh flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {tab === 'today' && <TodayScreen />}
          {tab === 'week' && <WeekScreen />}
          {tab === 'settings' && (
            <SettingsScreen onThemeOverride={handleThemeOverride} />
          )}
        </div>
      </div>

      <div className="safe-bottom border-t border-[var(--color-border)] bg-[var(--color-bg)]">
        <nav className="flex items-center justify-around py-2" role="navigation" aria-label="Hauptnavigation">
          <TabButton icon="today" label="Heute" active={tab === 'today'} onClick={() => setTab('today')} />
          <TabButton icon="week" label="Woche" active={tab === 'week'} onClick={() => setTab('week')} />
          <TabButton icon="settings" label="Einstellungen" active={tab === 'settings'} onClick={() => setTab('settings')} />
        </nav>
      </div>
    </div>
  )
}

function TabButton({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 py-1 px-5 min-h-[44px] justify-center" aria-label={label}>
      {icon === 'today' && (
        <svg className={`w-5 h-5 ${active ? 'opacity-100' : 'opacity-40'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      )}
      {icon === 'week' && (
        <svg className={`w-5 h-5 ${active ? 'opacity-100' : 'opacity-40'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 3v18h18" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </svg>
      )}
      {icon === 'settings' && (
        <svg className={`w-5 h-5 ${active ? 'opacity-100' : 'opacity-40'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4" />
          <path d="M4.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1A1.65 1.65 0 004.68 9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      )}
      <span className={`text-[11px] font-medium ${active ? 'opacity-100' : 'opacity-50'}`}>{label}</span>
    </button>
  )
}
