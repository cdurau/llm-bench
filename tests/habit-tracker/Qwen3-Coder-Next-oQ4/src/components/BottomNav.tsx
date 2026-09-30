import { useLocation } from 'react-router-dom';
import { Home, Calendar, Settings } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();
  const activeTab = location.pathname.replace('/', '') || 'today';

  const tabs = [
    { id: 'today', label: 'Heute', icon: <Home size={24} /> },
    { id: 'week', label: 'Woche', icon: <Calendar size={24} /> },
    { id: 'settings', label: 'Einstellungen', icon: <Settings size={24} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
      <div className="max-w-lg mx-auto flex justify-around items-center px-4 py-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              className={`
                flex flex-col items-center gap-1.5
                px-4 py-2 rounded-xl transition-all duration-200
                ${isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              <div className={isActive ? 'text-gray-900' : 'text-gray-400'}>
                {tab.icon}
              </div>
              <span className={`
                text-[10px] font-medium tracking-wide transition-opacity duration-200
                ${isActive ? 'opacity-100' : 'opacity-80'}
              `}>
                {tab.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
