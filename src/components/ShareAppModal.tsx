import React, { useState, useEffect } from 'react';
import { X, Copy, Check, QrCode, ExternalLink, Smartphone, Share2 } from 'lucide-react';
import QRCode from 'qrcode';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Fallback to shared app URL or current window location
  const appUrl = typeof window !== 'undefined' 
    ? (window.location.origin.includes('run.app') ? window.location.href : 'https://ais-pre-zjsa4idpkgnryizgdnwmvm-465082083164.asia-northeast1.run.app')
    : 'https://ais-pre-zjsa4idpkgnryizgdnwmvm-465082083164.asia-northeast1.run.app';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(appUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(() => {});
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const tinyUrlGenerator = `https://tinyurl.com/create.php?url=${encodeURIComponent(appUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white border-2 border-slate-300 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Share2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Share App &amp; Short Link</h3>
              <p className="text-xs font-semibold text-slate-600">Scan with phone or create a short URL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Scan Area */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">
          {qrDataUrl ? (
            <div className="p-2 bg-white rounded-2xl border-2 border-slate-300 shadow-sm">
              <img src={qrDataUrl} alt="App QR Code" className="w-48 h-48 rounded-lg" />
            </div>
          ) : (
            <div className="w-48 h-48 bg-slate-200 animate-pulse rounded-2xl flex items-center justify-center">
              <QrCode className="w-12 h-12 text-slate-400" />
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 pt-1">
            <Smartphone className="w-4 h-4 text-emerald-700" />
            <span>Point any phone camera at this QR code to open</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            No typing required—perfect for elderly users &amp; family members!
          </p>
        </div>

        {/* Current URL & Copy Button */}
        <div>
          <label className="block text-xs font-extrabold text-slate-800 mb-1">
            Current App Web Address
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-mono truncate select-all"
            />
            <button
              onClick={handleCopy}
              className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Shorten Link Quick Action */}
        <div className="p-3.5 bg-emerald-50/80 border-2 border-emerald-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
              Create a Memorable Short Link
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
              FREE &amp; INSTANT
            </span>
          </div>
          <p className="text-xs font-medium text-slate-700 leading-relaxed">
            You can turn this long address into an easy link like <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-bold text-emerald-900">tinyurl.com/my-medsync</code> in seconds.
          </p>
          <a
            href={tinyUrlGenerator}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[42px] px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-400 font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer text-center"
          >
            <span>Create Short URL on TinyURL</span>
            <ExternalLink className="w-4 h-4 text-emerald-700" />
          </a>
        </div>

        <div className="text-center pt-1">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
