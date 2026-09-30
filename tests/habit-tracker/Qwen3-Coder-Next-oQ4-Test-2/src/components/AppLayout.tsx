import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import './App.css'

export default function AppLayout({ children }: { children?: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  const navItems = [
    { id: 'nav-today', label: 'Heute', path: '/' },
    { id: 'nav-week', label: 'Woche', path: '/week' },
    { id: 'nav-settings', label: 'Einstellungen', path: '/settings' },
  ]
  
  const currentPath = location.pathname
  
  return (
    <div className="app-container">
      <main className="main-content">
        {children || <Outlet />}
      </main>
      
      <nav className="bottom-nav" role="navigation" aria-label="Hauptnavigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            data-testid={item.id}
            className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
