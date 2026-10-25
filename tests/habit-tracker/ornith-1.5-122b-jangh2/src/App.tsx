import { useState } from 'react'
import { StoreProvider } from './store'
import Nav, { type Screen } from './components/Nav'
import Today from './components/Today'
import Week from './components/Week'
import Settings from './components/Settings'

export default function App() {
  const [screen, setScreen] = useState<Screen>('today')

  return (
    <StoreProvider>
      <main className="theme-transition mx-auto max-w-3xl px-6 overflow-y-auto pb-28 pt-10">
        {screen === 'today' && <Today />}
        {screen === 'week' && <Week />}
        {screen === 'settings' && <Settings />}
      </main>
      <Nav screen={screen} onSet={setScreen} />
    </StoreProvider>
  )
}