import React, { useState } from 'react';
import { useMedSync } from '../context/MedSyncContext';
import { 
  ShieldAlert, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  HeartHandshake, 
  CheckSquare, 
  Square, 
  Sparkles, 
  HardDrive,
  UserCheck
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, seniorMode, setSeniorMode } = useMedSync();
  const [email, setEmail] = useState('sarah.chen@medsync.care');
  const [password, setPassword] = useState('senior123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [disclaimerConfirmed, setDisclaimerConfirmed] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!disclaimerConfirmed) {
      setErrorMsg('Please review and confirm the medical disclaimer to proceed.');
      return;
    }

    const res = login(email, password, rememberMe);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleQuickDemoLogin = () => {
    setEmail('sarah.chen@medsync.care');
    setPassword('senior123');
    setDisclaimerConfirmed(true);
    login('sarah.chen@medsync.care', 'senior123', true);
  };

  return (
    <div className="flex-1 flex flex-col justify-start px-4 py-5 max-w-md mx-auto w-full space-y-4">
      {/* Brand Topmark */}
      <div className="text-center pt-1 pb-1">
        <div className="inline-flex items-center justify-center p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl mb-2 shadow-sm ring-1 ring-emerald-300">
          <HeartHandshake className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          MedSync
        </h1>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">
          Personal Medication Adherence &amp; Safety Dashboard
        </p>
      </div>

      {/* 1. HEALTH & MEDICATION DISCLAIMER (High-Contrast, Prominent at Top) */}
      <div className="bg-white border-2 border-amber-300 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 stroke-[2.5]" />
          <h2 className="text-sm font-black uppercase tracking-wider">
            Important Medical Disclaimer
          </h2>
        </div>

        <div className="space-y-2 text-xs font-medium text-slate-700 leading-relaxed bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80">
          <p>
            <strong className="text-slate-900 font-bold">1. Tracking Tool Only:</strong> MedSync is an assistive adherence tool designed to support personal dose tracking. It does not provide medical diagnosis, prescribe drugs, or substitute for professional medical care.
          </p>
          <p>
            <strong className="text-slate-900 font-bold">2. Physician Directions:</strong> Always follow the specific instructions provided by your prescribing doctor or pharmacist. Never alter doses without medical advice.
          </p>
          <p>
            <strong className="text-slate-900 font-bold">3. Medical Emergencies:</strong> In a medical emergency, call <span className="font-extrabold text-rose-800 font-mono">911</span> or your local emergency hospital immediately.
          </p>
          <div className="pt-1 flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
            <HardDrive className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Local Storage: Your medication data is stored strictly on this device.</span>
          </div>
        </div>

        {/* Disclaimer Confirmation Checkbox */}
        <button
          type="button"
          onClick={() => setDisclaimerConfirmed(!disclaimerConfirmed)}
          className="flex items-center gap-2.5 text-left text-xs font-bold text-slate-900 cursor-pointer pt-0.5 select-none"
        >
          {disclaimerConfirmed ? (
            <CheckSquare className="w-5 h-5 text-emerald-700 shrink-0 stroke-[2.5]" />
          ) : (
            <Square className="w-5 h-5 text-slate-400 shrink-0 stroke-[2]" />
          )}
          <span className="leading-tight">
            I understand and accept this medical disclaimer.
          </span>
        </button>
      </div>

      {/* 2. LOGIN AND PASSWORD FORM (Underneath Disclaimer) */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
            <h3 className="text-base font-extrabold text-slate-900">
              Patient Sign In
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500 font-mono">
            SECURE LOCAL LOGIN
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-800">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
          {/* Email / Username Input */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">
              Username or Email
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sarah.chen@medsync.care"
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-3 text-base text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
            />
          </div>

          {/* Password Input with Show/Hide toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-extrabold text-slate-800">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show Password</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-3 text-base text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-colors pr-10"
              />
            </div>
          </div>

          {/* Remember Me on Local Device */}
          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none"
            >
              {rememberMe ? (
                <CheckSquare className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Remember me on this device</span>
            </button>
            <span className="text-[11px] font-semibold text-slate-500 font-mono">
              Local Session
            </span>
          </div>

          {/* Large Primary Sign In Button */}
          <button
            type="submit"
            className="w-full min-h-[50px] px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-base flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            <LogIn className="w-5 h-5 stroke-[2.5]" />
            <span>Sign In to Dashboard</span>
          </button>
        </form>

        {/* Quick Demo Access for Seniors / Evaluators */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="text-[11px] text-center font-bold text-slate-500 uppercase tracking-wider">
            Quick One-Tap Demo Access
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 border-2 border-slate-300 transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Sign In as Sarah Chen (Pre-Configured)</span>
          </button>
        </div>
      </div>

      {/* Security & Local Data Notice */}
      <div className="text-center text-[11px] font-semibold text-slate-500 pb-4">
        🔒 All medical data &amp; schedules are safely stored in your browser's local storage.
      </div>
    </div>
  );
};
