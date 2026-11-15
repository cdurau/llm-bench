import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// registerType: 'autoUpdate' – der generierte SW übernimmt Update/SkipWaiting
// selbst; hier wird nur registriert (immediate, auch bei erster Navigation).
registerSW({
  immediate: true,
  onRegisterError(error) {
    console.debug('Service-Worker-Registration fehlgeschlagen:', error)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
