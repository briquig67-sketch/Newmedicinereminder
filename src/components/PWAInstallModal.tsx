import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Check, 
  Share2, 
  PlusSquare, 
  QrCode, 
  Copy, 
  Sparkles, 
  ShieldCheck, 
  Wifi, 
  Bell
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import QRCode from 'qrcode';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'ios' | 'qr'>('direct');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const appUrl = typeof window !== 'undefined'
    ? (window.location.origin.includes('run.app') ? window.location.href : 'https://ais-pre-zjsa4idpkgnryizgdnwmvm-465082083164.asia-northeast1.run.app')
    : 'https://ais-pre-zjsa4idpkgnryizgdnwmvm-465082083164.asia-northeast1.run.app';

  useEffect(() => {
    if (isOpen) {
      if (isIOS) {
        setActiveTab('ios');
      } else if (isInstallable) {
        setActiveTab('direct');
      } else {
        setActiveTab('qr');
      }

      QRCode.toDataURL(appUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#064e3b',
          light: '#ffffff'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(() => {});
    }
  }, [isOpen, isIOS, isInstallable, appUrl]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    const success = await install();
    setInstalling(false);
    if (success) {
      onClose();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white border-2 border-slate-300 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md p-1.5 ring-2 ring-emerald-400">
              <img src="/icon.svg" alt="MedSync" className="w-full h-full" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Install MedSync App</span>
                <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              </h3>
              <p className="text-xs font-semibold text-slate-600">Install directly to your phone or tablet home screen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* App Highlights Banner */}
        <div className="grid grid-cols-3 gap-2 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center text-xs">
          <div className="flex flex-col items-center gap-1">
            <Smartphone className="w-4 h-4 text-emerald-700" />
            <span className="font-extrabold text-slate-900 text-[11px]">Home Screen</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Wifi className="w-4 h-4 text-emerald-700" />
            <span className="font-extrabold text-slate-900 text-[11px]">Works Offline</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Bell className="w-4 h-4 text-emerald-700" />
            <span className="font-extrabold text-slate-900 text-[11px]">Dose Alarms</span>
          </div>
        </div>

        {/* Already Installed State */}
        {isInstalled && (
          <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl text-emerald-950 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-sm font-black">MedSync is Already Installed!</h4>
              <p className="text-xs font-semibold text-emerald-900 mt-0.5">
                You are currently running the official standalone app on your device.
              </p>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        {!isInstalled && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-black">
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'direct'
                  ? 'bg-white text-emerald-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1-Tap Install
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'ios'
                  ? 'bg-white text-emerald-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              iPhone / iPad
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-white text-emerald-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scan Phone QR
            </button>
          </div>
        )}

        {/* Tab 1: Direct 1-Tap Install (Android, Chrome, Edge) */}
        {!isInstalled && activeTab === 'direct' && (
          <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
              <Download className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900">Install On This Device</h4>
              <p className="text-xs font-semibold text-slate-600 mt-1 max-w-xs mx-auto">
                Installs MedSync as a standalone application on your home screen or desktop with full offline access.
              </p>
            </div>

            {isInstallable ? (
              <button
                onClick={handleInstallClick}
                disabled={installing}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-all cursor-pointer"
              >
                <Download className="w-5 h-5 stroke-[2.5]" />
                <span>{installing ? 'Installing...' : 'Install App to Home Screen'}</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-300 text-left space-y-1">
                  <div className="font-black flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>How to install right now:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    If using <strong>Chrome or Edge</strong>, tap the <strong>Install</strong> icon in the address bar (or menu ⋮ ➔ <em>"Install MedSync"</em>).
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    If on <strong>iPhone or iPad</strong>, switch to the <em>"iPhone / iPad"</em> tab above for simple 2-step instructions.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: iOS Safari Instructions */}
        {!isInstalled && activeTab === 'ios' && (
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>How to Install on iPhone &amp; iPad</span>
            </h4>
            <p className="text-xs font-medium text-slate-600">
              Apple Safari lets you install any website directly as a full native app:
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-black flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <span className="font-extrabold text-slate-900 block">Tap the Share Button</span>
                  <span className="text-slate-600 text-[11px] leading-snug block mt-0.5">
                    Tap the <strong>Share</strong> icon (the square with an arrow pointing up <Share2 className="w-3.5 h-3.5 inline text-blue-600" />) at the bottom of Safari.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-black flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <span className="font-extrabold text-slate-900 block">Choose "Add to Home Screen"</span>
                  <span className="text-slate-600 text-[11px] leading-snug block mt-0.5">
                    Scroll down in the share sheet and tap <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-slate-800" />).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-black flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <span className="font-extrabold text-slate-900 block">Confirm by tapping "Add"</span>
                  <span className="text-slate-600 text-[11px] leading-snug block mt-0.5">
                    Tap <strong>Add</strong> in the top-right corner. The MedSync app icon will now appear on your home screen!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: QR Code to Install on Phone from Computer */}
        {!isInstalled && activeTab === 'qr' && (
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-center">
            <h4 className="text-sm font-black text-slate-900">Scan with Phone Camera</h4>
            <p className="text-xs font-semibold text-slate-600 max-w-xs mx-auto">
              Scan this QR code with your iPhone or Android camera to open and install MedSync on your phone:
            </p>

            {qrDataUrl && (
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-300 w-fit mx-auto shadow-sm">
                <img src={qrDataUrl} alt="Scan to install MedSync" className="w-44 h-44 mx-auto" />
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 truncate"
              />
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
