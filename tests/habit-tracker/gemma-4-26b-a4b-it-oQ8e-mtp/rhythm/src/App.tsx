import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import TodayScreen from './components/today/TodayScreen';
import WeekScreen from './components/week/WeekScreen';
import SettingsScreen from './components/settings/SettingsScreen';
import { ThemeProvider } from './context/ThemeContext';

type Tab = 'today' | 'week' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('today');

  const renderContent = () => {
    switch (activeTab) {
      case 'today':
        return <TodayScreen />;
      case 'week':
        return <WeekScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <TodayScreen />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-svh flex flex-col items-center">
        <main className="w-full max-w-md flex-1 pb-20">
          {renderContent()}
        </main>
        <Layout activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </ThemeProvider>
  );
}

export default App;
