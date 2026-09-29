import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RhythmProvider } from './store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RhythmProvider>
      <App />
    </RhythmProvider>
  </StrictMode>,
)
