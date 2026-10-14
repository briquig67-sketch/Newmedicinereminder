import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl border border-amber-400 animate-in fade-in slide-in-from-bottom duration-300">
      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode — Your scheduled alarms and local logs remain active.</span>
    </div>
  );
};
