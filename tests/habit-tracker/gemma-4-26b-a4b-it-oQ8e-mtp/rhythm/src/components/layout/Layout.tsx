import React from 'react';
import { Calendar, CheckCircle2, Settings } from 'lucide-react';

type Tab = 'today' | 'week' | 'settings';

interface LayoutProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Heute', icon: <CheckCircle2 size={24} /> },
    { id: 'week', label: 'Woche', icon: <Calendar size={24} /> },
    { id: 'settings', label: 'Einstellungen', icon: <Settings size={24} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--card-bg)] border-t border-[var(--border)] z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              activeTab === tab.id ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {tab.icon}
            <span className="text-xs mt-1 font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Layout;
