import { Link } from 'react-router-dom';
import { Home, Calendar, Settings } from 'lucide-react';

export function Navbar() {
  const tabs = [
    { id: 'today', label: 'Heute', icon: <Home size={24} /> },
    { id: 'week', label: 'Woche', icon: <Calendar size={24} /> },
    { id: 'settings', label: 'Einstellungen', icon: <Settings size={24} /> },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-around items-center px-4 py-3">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={`/${tab.id}`}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 text-gray-400 hover:text-gray-600"
            >
              <div className="text-gray-400">{tab.icon}</div>
              <span className="text-[10px] font-medium opacity-80">{tab.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
