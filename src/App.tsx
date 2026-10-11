import React, { useState } from 'react';
import { MedSyncProvider, useMedSync } from './context/MedSyncContext';
import { MobileFrame } from './components/MobileFrame';
import { NavigationTabBar, TabType } from './components/NavigationTabBar';
import { TodayView } from './components/TodayView';
import { AnalyticsView } from './components/AnalyticsView';
import { MedicinesView } from './components/MedicinesView';
import { HistoryView } from './components/HistoryView';
import { LoginScreen } from './components/LoginScreen';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const { todayDoses, isAuthenticated } = useMedSync();

  const pendingDosesCount = todayDoses.filter((d) => d.status === 'pending').length;

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="flex-1 flex flex-col justify-between min-h-full">
      {/* Active Tab View */}
      <div className="flex-1">
        {activeTab === 'today' && <TodayView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'medicines' && <MedicinesView />}
        {activeTab === 'history' && <HistoryView />}
      </div>

      {/* Sticky Bottom Thumb-Zone Navigation Bar */}
      <NavigationTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingDosesCount}
      />
    </div>
  );
};

export default function App() {
  return (
    <MedSyncProvider>
      <MobileFrame>
        <MainAppContent />
      </MobileFrame>
    </MedSyncProvider>
  );
}

