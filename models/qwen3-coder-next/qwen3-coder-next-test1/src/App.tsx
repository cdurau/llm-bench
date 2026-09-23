import { useState } from 'react';
import { Header } from './components/layout/Header';
import { DateNavigation } from './components/today/DateNavigation';
import { Dashboard } from './components/dashboard/Dashboard';
import { ActivityList } from './components/activities/ActivityList';
import { AddActivityForm } from './components/activities/AddActivityForm';
import { AppProvider, useApp } from './contexts/AppContext';

function AppContent() {
  const { appState, changeDate, goToday } = useApp();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Navigation handlers
  const handlePreviousDay = () => {
    const today = new Date();
    const current = new Date(appState.currentViewDate + 'T00:00:00');
    
    if (current <= today) return; // Cannot go before today
    
    const previous = new Date(current);
    previous.setDate(previous.getDate() - 1);
    
    changeDate(previous.toISOString().split('T')[0]);
  };
  
  const handleNextDay = () => {
    const current = new Date(appState.currentViewDate + 'T00:00:00');
    const tomorrow = new Date(current);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    changeDate(tomorrow.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white transition-colors duration-200">
      <Header onAddActivity={() => setIsAddModalOpen(true)} />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Dashboard */}
        <Dashboard />
        
        {/* Datumsnavigation */}
        <DateNavigation 
          currentDate={appState.currentViewDate}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          onToday={goToday}
        />
        
        {/* Aktivitätsliste */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Aktivitäten
          </h2>
          
          <ActivityList />
        </div>
      </main>
      
      {/* Modals */}
      <AddActivityForm 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
