import { useState } from 'react';
import BottomNav from './components/BottomNav';
import UpdatePrompt from './components/UpdatePrompt';
import SettingsScreen from './screens/SettingsScreen';
import TodayScreen from './screens/TodayScreen';
import WeekScreen from './screens/WeekScreen';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { AppProvider } from './hooks/useAppData';
import { ThemeProvider } from './lib/theme';
import type { TabId } from './lib/types';

function Shell() {
  const [tab, setTab] = useState<TabId>('heute');
  const { needRefresh } = useRegisterSW({
    onRegistered: () => undefined,
    onRegisterError: () => undefined,
  });

  return (
    <div className="flex min-h-svh flex-col bg-canvas font-sans text-ink">
      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-40 pt-6">
        {tab === 'heute' ? <TodayScreen /> : null}
        {tab === 'woche' ? <WeekScreen /> : null}
        {tab === 'einstellungen' ? <SettingsScreen /> : null}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
      <UpdatePrompt needRefresh={needRefresh[0]} onUpdate={() => window.location.reload()} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </ThemeProvider>
  );
}