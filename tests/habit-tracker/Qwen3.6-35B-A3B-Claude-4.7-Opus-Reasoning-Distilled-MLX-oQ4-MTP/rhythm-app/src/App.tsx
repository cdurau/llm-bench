import { useState, useEffect } from 'react';
import type { DarkMode } from './lib/types';
import { getDarkMode } from './lib/db';
import { Today } from './components/Today';
import { Week } from './components/Week';
import { Settings } from './components/Settings';
import { IconCalendar, IconChart, IconSettings } from './icons';

type Tab = 'today' | 'week' | 'settings';

export default function App() {
  const [tab, setTab] = useState<Tab>('today');
  const [darkMode, setDarkModeState] = useState<DarkMode>('system');

  useEffect(() => {
    (async () => {
      const dm = await getDarkMode();
      setDarkModeState(dm);
    })();
  }, []);

  useEffect(() => {
    document.body.style.background =
      darkMode === 'dark' ? '#1a1a1a' : darkMode === 'light' ? '#fff' : '';
  }, [darkMode]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {tab === 'today' && <Today />}
      {tab === 'week' && <Week />}
      {tab === 'settings' && <Settings />}

      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-center"
        style={{
          borderTop: '1px solid #e7e5e4',
          background: darkMode === 'dark' ? '#1a1a1a' : '#fff',
          height: 68,
        }}
      >
        <div className="flex gap-0">
          <TabButton
            label="Heute"
            icon={<IconCalendar size={20} />}
            active={tab === 'today'}
            onClick={() => setTab('today')}
          />
          <TabButton
            label="Woche"
            icon={<IconChart size={20} />}
            active={tab === 'week'}
            onClick={() => setTab('week')}
          />
          <TabButton
            label="Einstellungen"
            icon={<IconSettings size={20} />}
            active={tab === 'settings'}
            onClick={() => setTab('settings')}
          />
        </div>
      </nav>
    </div>
  );
}

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-1 px-2 py-4
        rounded-xl transition-colors
        hover:bg-neutral-100 active:bg-neutral-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400"
      style={{
        color: active ? '#1c1917' : '#78716c',
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: 11, fontWeight: 500 }}>{label}</span>
    </button>
  );
}
