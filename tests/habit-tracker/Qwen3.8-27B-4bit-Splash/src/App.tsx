import { useState } from 'react'
import { BottomNav, type Tab } from './components/BottomNav'
import { AppProvider, useApp } from './state/AppProvider'
import { SettingsScreen } from './screens/SettingsScreen'
import { ThemeProvider } from './theme/ThemeProvider'
import { TodayScreen } from './screens/TodayScreen'
import { WeekScreen } from './screens/WeekScreen'

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </ThemeProvider>
  )
}

function Shell() {
  const [tab, setTab] = useState<Tab>('heute')
  const { loaded } = useApp()

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <main className="mx-auto w-full max-w-[440px] px-5 pt-8 pb-32">
        {!loaded ? (
          <div className="flex h-64 items-center justify-center text-sm text-ink-faint">
            Lädt …
          </div>
        ) : (
          <div key={tab} className="fade-swap">
            {tab === 'heute' && <TodayScreen />}
            {tab === 'woche' && <WeekScreen />}
            {tab === 'einstellungen' && <SettingsScreen />}
          </div>
        )}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}
