import { useState } from 'react'
import type { TabId } from './types'
import { useTheme } from './hooks/useTheme'
import { useData } from './hooks/useData'
import { Today } from './components/Today'
import { Week } from './components/Week'
import { Settings } from './components/Settings'
import { BottomNav } from './components/BottomNav'

export default function App() {
  const theme = useTheme()
  const data = useData()
  const [tab, setTab] = useState<TabId>('today')

  const render = () => {
    switch (tab) {
      case 'week':
        return <Week data={data} theme={theme} />
      case 'settings':
        return <Settings data={data} theme={theme} />
      case 'today':
      default:
        return <Today data={data} theme={theme} />
    }
  }

  return (
    <div className="min-h-full bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <div className="mx-auto flex min-h-full max-w-[420px] flex-col">
        <main className="flex-1 px-5 pb-28 pt-7">
          {render()}
        </main>
        <BottomNav tab={tab} onChange={setTab} />
      </div>
    </div>
  )
}
