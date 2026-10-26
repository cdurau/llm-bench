import { lazy, Suspense, useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { SettingsScreen } from './components/SettingsScreen'
import { TodayScreen } from './components/TodayScreen'
import { useTheme } from './hooks/useTheme'
import type { TabId } from './types'

// The week screen pulls in the charting library; keep it out of the first load.
const WeekScreen = lazy(() =>
  import('./components/WeekScreen').then((module) => ({
    default: module.WeekScreen,
  })),
)

function ScreenSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="h-10 w-40 animate-pulse rounded-xl bg-elevated" />
      <div className="h-24 animate-pulse rounded-[20px] bg-elevated" />
      <div className="h-64 animate-pulse rounded-[20px] bg-elevated" />
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<TabId>('today')
  const theme = useTheme()

  return (
    <div className="min-h-svh">
      <main className="safe-top mx-auto w-full max-w-[440px] px-5 pb-32 pt-6">
        {tab === 'today' ? <TodayScreen isDark={theme.isDark} /> : null}
        {tab === 'week' ? (
          <Suspense fallback={<ScreenSkeleton />}>
            <WeekScreen isDark={theme.isDark} />
          </Suspense>
        ) : null}
        {tab === 'settings' ? <SettingsScreen theme={theme} /> : null}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}