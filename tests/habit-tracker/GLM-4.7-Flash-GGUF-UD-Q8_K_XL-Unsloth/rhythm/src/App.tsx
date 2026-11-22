import { useState } from 'react';
import TodayScreen from './components/TodayScreen';
import WeekScreen from './components/WeekScreen';
import SettingsScreen from './components/SettingsScreen';

type Screen = 'today' | 'week' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('today');

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main>
        {currentScreen === 'today' && (
          <TodayScreen 
            onNavigateToWeek={() => setCurrentScreen('week')}
          />
        )}
        {currentScreen === 'week' && (
          <WeekScreen 
            onNavigateToToday={() => setCurrentScreen('today')}
          />
        )}
        {currentScreen === 'settings' && (
          <SettingsScreen 
            onNavigateToToday={() => setCurrentScreen('today')}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border/50 shadow-lg">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            <button
              onClick={() => setCurrentScreen('today')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                currentScreen === 'today' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span className="text-xl">📅</span>
              <span className="text-xs font-medium">Heute</span>
            </button>
            
            <button
              onClick={() => setCurrentScreen('week')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                currentScreen === 'week' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span className="text-xl">📊</span>
              <span className="text-xs font-medium">Woche</span>
            </button>
            
            <button
              onClick={() => setCurrentScreen('settings')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                currentScreen === 'settings' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span className="text-xl">⚙️</span>
              <span className="text-xs font-medium">Einstellungen</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
