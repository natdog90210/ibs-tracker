import { Edit3, Calendar, TrendingUp, Settings } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavProps {
  current: Screen;
  onChange: (screen: Screen) => void;
}

export default function BottomNav({ current, onChange }: BottomNavProps) {
  const tabs: { id: Screen; label: string; icon: typeof Edit3 }[] = [
    { id: 'log', label: 'Log', icon: Edit3 },
    { id: 'history', label: 'History', icon: Calendar },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = current === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
