import React, { useEffect } from 'react';
import { Bus, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SplashScreen: React.FC = () => {
  const { setSplashCompleted, settings } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashCompleted(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, [setSplashCompleted]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white overflow-hidden select-none animate-in fade-in duration-300">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-md animate-in zoom-in-95 duration-500">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 ring-4 ring-white/10 animate-bounce duration-1000">
            <Bus className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Production Ready Suite v2.4
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 font-sans">
          {settings.schoolName || 'TransTrack'}
        </h1>
        <p className="text-sm text-slate-400 mb-10 max-w-xs leading-relaxed font-normal">
          Centralized School Transit & Bus Fee Monitoring Architecture
        </p>

        {/* Loading Progress bar */}
        <div className="w-48 bg-slate-800/80 h-1.5 rounded-full overflow-hidden mb-6 p-0.5 border border-slate-700">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full animate-[pulse_1.5s_ease-in-out_infinite] w-3/4" />
        </div>

        <button
          onClick={() => setSplashCompleted(true)}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors group cursor-pointer"
        >
          Skip Introduction <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="absolute bottom-6 text-center text-[11px] text-slate-500 tracking-wider uppercase font-mono">
        Secured by JWT & Refresh Token Simulation
      </div>
    </div>
  );
};
