import React, { useState } from 'react';
import { useMedSync } from '../context/MedSyncContext';
import { 
  Smartphone, 
  Monitor, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Wifi, 
  Battery, 
  Check, 
  X,
  Sparkles,
  Type,
  Sun,
  LogOut,
  Trash2,
  Share2
} from 'lucide-react';
import { ShareAppModal } from './ShareAppModal';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineIndicator } from './OfflineIndicator';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [isDeviceMockup, setIsDeviceMockup] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const {
    soundEnabled,
    setSoundEnabled,
    seniorMode,
    setSeniorMode,
    isAuthenticated,
    logout,
    clearAllUserData,
    loadDemoData,
    resetToSampleData,
    activeNotification,
    clearNotification,
    isLiveSimulationActive
  } = useMedSync();

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-start p-0 md:p-6 select-none ${seniorMode ? 'text-base' : 'text-sm'}`}>
      {/* Top Desktop Controls Bar (Crisp, High-Contrast, Senior Accessible) */}
      <header className="w-full max-w-5xl hidden md:flex items-center justify-between py-3 px-5 mb-4 bg-white shadow-sm border border-slate-200 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              MedSync Mobile
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-medium text-slate-600">
            Senior-Friendly Medication Adherence &amp; Real-Time Analytics
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Senior Large Text Mode Toggle */}
          <button
            onClick={() => setSeniorMode(!seniorMode)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              seniorMode
                ? 'bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
            title="Toggle extra-large readable text and buttons for elderly users"
          >
            <Type className="w-4 h-4 text-amber-700" />
            <span>Senior Text Size {seniorMode ? '(On)' : '(Off)'}</span>
          </button>

          {/* Viewport switch */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-300">
            <button
              onClick={() => setIsDeviceMockup(true)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                isDeviceMockup
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone Frame</span>
            </button>
            <button
              onClick={() => setIsDeviceMockup(false)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                !isDeviceMockup
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
            title={soundEnabled ? 'Mute sound chimes' : 'Enable sound chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* PWA Mobile App Install Button */}
          <PWAInstallButton variant="header" />

          {/* Share App & QR Short Link */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            title="Get short URL, share link, and scan QR code"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Short Link &amp; QR</span>
          </button>

          {/* Clear All Stored Data */}
          <button
            onClick={clearAllUserData}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-800 border border-slate-300 hover:border-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Clear all stored patient data, prescriptions, and history to start completely fresh"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Clear All Data</span>
          </button>

          {/* Load Sample Demo Data */}
          <button
            onClick={loadDemoData}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-300 transition-colors cursor-pointer"
            title="Load sample example data for preview"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sign Out Button (when logged in) */}
          {isAuthenticated && (
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Sign out to Disclaimer and Login screen"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Viewport Container: Bright Silver Frame vs Edge-to-Edge */}
      <main className="w-full flex justify-center items-center flex-1">
        {isDeviceMockup ? (
          /* Senior-Friendly Bright Phone Frame Shell */
          <div className="relative w-full max-w-[428px] h-[880px] max-h-[96vh] bg-slate-50 rounded-[48px] p-3 shadow-2xl shadow-slate-400/30 border-[8px] border-slate-300 flex flex-col overflow-hidden ring-1 ring-slate-400/40">
            {/* Phone Hardware Details (Speaker + Island) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-200 rounded-b-2xl z-50 flex items-center justify-center gap-2 border-b border-slate-300">
              <div className="w-10 h-1.5 bg-slate-400 rounded-full" />
              <div className="w-2.5 h-2.5 bg-slate-400 rounded-full ring-1 ring-slate-300" />
            </div>

            {/* iOS/Android Status Bar in High Contrast Dark Slate */}
            <div className="pt-2 px-6 pb-1 flex items-center justify-between text-xs font-mono font-bold text-slate-800 shrink-0 z-40 select-none bg-slate-50 border-b border-slate-200/60">
              <span className="tabular-nums font-extrabold text-sm">{currentTime}</span>
              <div className="flex items-center gap-2">
                {isLiveSimulationActive && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>5G SYNC</span>
                  </span>
                )}
                <Wifi className="w-4 h-4 text-slate-700 stroke-[2.5]" />
                <Battery className="w-4 h-4 text-slate-800 stroke-[2.5]" />
              </div>
            </div>

            {/* In-App Floating Toast Notification Banner */}
            {activeNotification && (
              <div className="absolute top-12 left-4 right-4 z-50 animate-in slide-in-from-top-3 duration-200">
                <div className="bg-white border-2 border-emerald-600 rounded-2xl p-3.5 shadow-xl flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {activeNotification.title}
                      </h4>
                      <p className="text-xs font-medium text-slate-700 mt-0.5 leading-snug">
                        {activeNotification.message}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearNotification}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable Viewport Content Screen (Clean, Bright Canvas) */}
            <div className="flex-1 overflow-y-auto no-scrollbar rounded-[32px] bg-slate-50 flex flex-col relative">
              {children}
            </div>

            {/* Bottom Hardware Home Bar Indicator */}
            <div className="pt-2 pb-1 flex justify-center z-40 bg-slate-50">
              <div className="w-32 h-1 bg-slate-400 rounded-full" />
            </div>
          </div>
        ) : (
          /* Full Viewport Mode */
          <div className="w-full max-w-lg min-h-screen bg-slate-50 shadow-xl relative flex flex-col border-x border-slate-200">
            {/* Floating Toast Notification Banner in Full Viewport */}
            {activeNotification && (
              <div className="sticky top-3 mx-4 z-50 animate-in slide-in-from-top-3 duration-200">
                <div className="bg-white border-2 border-emerald-600 rounded-2xl p-3.5 shadow-xl flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {activeNotification.title}
                      </h4>
                      <p className="text-xs font-medium text-slate-700 mt-0.5">
                        {activeNotification.message}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearNotification}
                    className="text-slate-400 hover:text-slate-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col">{children}</div>
          </div>
        )}
      </main>

      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <OfflineIndicator />
    </div>
  );
};
