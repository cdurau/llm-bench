import { useState } from 'react'
import { RhythmProvider } from './store'
import { BottomNav, type TabId } from './components/BottomNav'
import { TodayScreen } from './components/TodayScreen'
import { WeekScreen } from './components/WeekScreen'
import { SettingsScreen } from './components/SettingsScreen'

function Shell() {
  const [tab, setTab] = useState<TabId>('heute')

  return (
    <div className="min-h-dvh bg-canvas font-sans text-body">
      <main className="mx-auto w-full max-w-md px-5 pt-8 pb-32">
        {tab === 'heute' ? (
          <TodayScreen />
        ) : tab === 'woche' ? (
          <WeekScreen onGoToToday={() => setTab('heute')} />
        ) : (
          <SettingsScreen />
        )}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}

export default function App() {
  return (
    <RhythmProvider>
      <Shell />
    </RhythmProvider>
  )
}
