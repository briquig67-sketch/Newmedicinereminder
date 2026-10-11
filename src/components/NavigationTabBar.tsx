import React from 'react';
import { Calendar, BarChart3, Pill, History } from 'lucide-react';
import { useMedSync } from '../context/MedSyncContext';

export type TabType = 'today' | 'analytics' | 'medicines' | 'history';

interface NavigationTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingCount?: number;
}

export const NavigationTabBar: React.FC<NavigationTabBarProps> = ({
  activeTab,
  onTabChange,
  pendingCount = 0,
}) => {
  const { seniorMode } = useMedSync();

  const tabs = [
    {
      id: 'today' as TabType,
      label: 'Today',
      icon: Calendar,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics',
      icon: BarChart3,
      livePulse: true,
    },
    {
      id: 'medicines' as TabType,
      label: 'Medicines',
      icon: Pill,
    },
    {
      id: 'history' as TabType,
      label: 'History',
      icon: History,
    },
  ];

  return (
    <nav
      className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 shadow-lg px-2 pt-1.5 pb-2"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[50px] min-w-[48px] flex flex-col items-center justify-center relative py-1 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-emerald-800 font-extrabold bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[2]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white font-extrabold text-[11px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white tabular-nums">
                    {tab.badge}
                  </span>
                )}
                {tab.livePulse && (
                  <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping opacity-75" />
                )}
              </div>
              <span className={`tracking-tight mt-1 truncate ${seniorMode ? 'text-xs font-bold' : 'text-[11px] font-semibold'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
