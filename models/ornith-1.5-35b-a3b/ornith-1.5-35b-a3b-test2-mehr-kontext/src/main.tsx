import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { NotificationsProvider } from './hooks/useNotifications'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root-Element #root wurde nicht gefunden')
}

createRoot(rootElement).render(
  <StrictMode>
    <NotificationsProvider>
      <App />
    </NotificationsProvider>
  </StrictMode>,
)
