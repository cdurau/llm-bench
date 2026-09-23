import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '../common/Button';

export function Header({ onAddActivity }: { onAddActivity: () => void }) {
  const { appState, theme, toggleTheme } = useApp();
  
  // Berechne Fortschritt für den angezeigten Tag
  const completed = useMemo(() => {
    return appState.dailyStatuses.filter(
      s => s.date === appState.currentViewDate && s.completed
    ).length;
  }, [appState.dailyStatuses, appState.currentViewDate]);
  
  const total = useMemo(() => {
    return appState.activities.length;
  }, [appState.activities]);
  
  const today = new Date().toISOString().split('T')[0];
  const isToday = appState.currentViewDate === today;
  
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo und Titel */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                PulseBoard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {isToday 
                  ? 'Heute' 
                  : new Intl.DateTimeFormat('de-DE', { month: 'long', day: 'numeric' }).format(new Date(appState.currentViewDate + 'T00:00:00'))
                }
              </p>
            </div>
          </div>
          
          {/* Aktionen */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isToday && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
                <div className="w-16 bg-gray-200 dark:bg-slate-700 rounded-full h-5 overflow-hidden">
                  <div 
                    className="bg-green-500 h-full rounded-full"
                    style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-green-700 dark:text-green-300 whitespace-nowrap">
                  {total > 0 ? Math.round((completed / total) * 100) : 0}%
                </span>
              </div>
            )}
            
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
              aria-label={`Zum ${theme === 'light' ? 'Dark Mode' : 'Light Mode'} wechseln`}
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </Button>
            
            <Button size="sm" onClick={onAddActivity}>
              + Aktivität
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
