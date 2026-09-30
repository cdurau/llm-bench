import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppStateProvider } from './context';
import { TodayScreen } from './screens/TodayScreen';
import { WeekScreen } from './screens/WeekScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { BottomNav } from './components/BottomNav';

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-lg mx-auto min-h-screen bg-white shadow-xl pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={
            <>
              <div className="p-4 pt-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Heute</h1>
                </div>
              </div>
              <TodayScreen />
            </>
          } />
          <Route path="/week" element={
            <>
              <div className="p-4 pt-6">
                <h1 className="text-2xl font-bold text-gray-900">Woche</h1>
              </div>
              <WeekScreen />
            </>
          } />
          <Route path="/settings" element={
            <>
              <div className="p-4 pt-6">
                <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
              </div>
              <SettingsScreen />
            </>
          } />
        </Routes>
        <BottomNav />
      </div>
    </div>
  );
}

export function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppStateProvider>
  );
}
