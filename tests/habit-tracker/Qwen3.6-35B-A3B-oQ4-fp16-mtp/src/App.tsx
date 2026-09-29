import { useState, useEffect, useCallback } from 'react'
import Today from './components/Today'
import Week from './components/Week'
import Settings from './components/Settings'
import BottomNav from './components/BottomNav'
import type { TabId } from './types'

export default function App() {
  const [tab, setTab] = useState<TabId>('today')
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('rhythm-dark-mode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.getElementById('root')!
    const html = document.documentElement

    if (darkMode) {
      root.classList.add('dark-mode')
      html.classList.remove('light-mode')
      html.classList.add('dark-mode')
    } else {
      root.classList.remove('dark-mode')
      html.classList.remove('dark-mode')
      html.classList.add('light-mode')
    }
    localStorage.setItem('rhythm-dark-mode', String(darkMode))
  }, [darkMode])

  const toggleDark = useCallback(() => setDarkMode((d) => !d), [])

  return (
    <div className={`min-h-dvh flex flex-col ${darkMode ? 'bg-[#1a1a1a] text-[#f0efe9]' : 'bg-[#faf9f7] text-[#1a1a1a]'}`}>
      <main className="flex-1 pb-24">
        {tab === 'today' && <Today />}
        {tab === 'week' && <Week />}
        {tab === 'settings' && <Settings onToggleDark={toggleDark} darkMode={darkMode} />}
      </main>
      <BottomNav active={tab} onTabChange={setTab} />
    </div>
  )
}
