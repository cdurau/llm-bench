import { useCallback, useEffect, useState } from 'react';
import BottomNav, { type Tab } from './components/BottomNav';
import TodayScreen from './screens/TodayScreen';
import WeekScreen from './screens/WeekScreen';
import SettingsScreen from './screens/SettingsScreen';
import { useRhythmData } from './lib/useRhythmData';
import { applyTheme, getStoredTheme, storeTheme } from './lib/theme';
import type { ThemePreference } from './lib/types';

export default function App() {
  const [tab, setTab] = useState<Tab>('today');
  const [themePref, setThemePref] = useState<ThemePreference>(() => getStoredTheme());
  const data = useRhythmData();

  useEffect(() => {
    applyTheme(themePref);
  }, [themePref]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (themePref === 'system') applyTheme('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themePref]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

  const handleThemeChange = useCallback((t: ThemePreference) => {
    setThemePref(t);
    storeTheme(t);
  }, []);

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <main className="mx-auto w-full max-w-[430px] px-4 pb-28 pt-6">
        {tab === 'today' && <TodayScreen data={data} />}
        {tab === 'week' && <WeekScreen data={data} />}
        {tab === 'settings' && (
          <SettingsScreen data={data} themePref={themePref} onThemeChange={handleThemeChange} />
        )}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
