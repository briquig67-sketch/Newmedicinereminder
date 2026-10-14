import React, { useState } from 'react';
import { Download, Smartphone, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'header',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already running inside standalone installed app, don't show install buttons
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <div className={`p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 text-white shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-emerald-200" />
                <span>Install MedSync App</span>
              </div>
              <h4 className="text-sm font-black leading-tight">Install on your Phone or Tablet</h4>
              <p className="text-[11px] text-emerald-100 font-medium">Use offline without opening a browser</p>
            </div>
          </div>

          <button
            onClick={handleClick}
            className="px-3.5 py-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 active:scale-95 font-black text-xs shrink-0 shadow-sm transition-all cursor-pointer"
          >
            Install App
          </button>
        </div>

        <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // Header button variant
  return (
    <>
      <button
        onClick={handleClick}
        className={`px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${className}`}
        title="Install MedSync to your home screen"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Install App</span>
      </button>

      <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
