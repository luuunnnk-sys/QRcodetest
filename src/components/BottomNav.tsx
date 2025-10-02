import { Home, QrCode, Clock } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'dashboard' | 'scanner' | 'history';
  onTabChange: (tab: 'dashboard' | 'scanner' | 'history') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard' as const, icon: Home, label: 'Accueil' },
    { id: 'scanner' as const, icon: QrCode, label: 'Scanner' },
    { id: 'history' as const, icon: Clock, label: 'Historique' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 safe-area-inset-bottom z-50">
      <div className="flex justify-around items-center h-20 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 px-6 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-6 h-6 transition-transform duration-200 ${
                  isActive ? 'scale-110' : ''
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  isActive ? 'font-bold' : ''
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
