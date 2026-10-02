import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root not found')
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
