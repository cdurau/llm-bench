import { useState } from 'react'
import Today from './components/Today'
import Week from './components/Week'
import Settings from './components/Settings'
import BottomNav from './components/BottomNav'

type Tab = 'today' | 'week' | 'settings'

function App() {
  const [active, setActive] = useState<Tab>('today')

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 transition-colors duration-200">
      <div className="max-w-md mx-auto pb-24">
        {active === 'today' && <Today />}
        {active === 'week' && <Week />}
        {active === 'settings' && <Settings />}
      </div>
      <BottomNav active={active} onTabChange={setActive} />
    </div>
  )
}

export default App
