import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bus, MapPin, Clock, Phone, User, CheckCircle2, 
  AlertTriangle, ArrowRight, ShieldCheck, CreditCard 
} from 'lucide-react';

export const StudentDashboardView: React.FC = () => {
  const { currentUser, routes, buses, stops, setStudentTab, settings } = useApp();

  if (!currentUser) return null;

  const rt = routes.find(r => r.id === currentUser.routeId);
  const bs = buses.find(b => b.id === currentUser.busId);
  const sp = stops.find(s => s.id === currentUser.stopId);

  const term1Paid = currentUser.paidAmount >= currentUser.term1Fee;
  const term2Paid = currentUser.paidAmount >= (currentUser.term1Fee + currentUser.term2Fee);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-8 md:p-10 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold font-mono">
            ID: {currentUser.studentId}
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Hello, {currentUser.name}! 👋
          </h2>
          <p className="text-slate-400 text-xs flex items-center gap-2 font-medium">
            <span>Class {currentUser.class} • Section {currentUser.section}</span>
            <span>•</span>
            <span className="text-indigo-400 font-semibold">{settings.academicYear}</span>
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-right shrink-0 min-w-[180px]">
          <span className="text-[10px] uppercase font-bold text-slate-300 block">Total Due Balance</span>
          <span className="text-3xl font-mono font-black text-amber-400">
            {settings.currency}{currentUser.pendingAmount}
          </span>
          {currentUser.pendingAmount > 0 && (
            <button
              onClick={() => setStudentTab('payment')}
              className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Pay Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Cards Requested in Prompt: Term 1 Status, Term 2 Status, Pending Amount */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Term 1 Status */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Term 1 Fee Status</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              ${currentUser.term1Fee}
            </div>
            <div className="mt-2">
              {term1Paid ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" /> SETTLED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                  <AlertTriangle className="w-3 h-3" /> PENDING DUE
                </span>
              )}
            </div>
          </div>
          <div className={`p-4 rounded-2xl ${term1Paid ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950' : 'bg-amber-50 text-amber-600 dark:bg-amber-950'}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Term 2 Status */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Term 2 Fee Status</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              ${currentUser.term2Fee}
            </div>
            <div className="mt-2">
              {term2Paid ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" /> SETTLED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                  <AlertTriangle className="w-3 h-3" /> DUE SOON
                </span>
              )}
            </div>
          </div>
          <div className={`p-4 rounded-2xl ${term2Paid ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950' : 'bg-rose-50 text-rose-600 dark:bg-rose-950'}`}>
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Pending Amount Summary */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Net Pending Amount</span>
            <div className="text-2xl font-mono font-black text-rose-600 dark:text-rose-400 mt-1">
              {settings.currency}{currentUser.pendingAmount}
            </div>
            <div className="text-[10px] text-slate-400 mt-2 font-mono">
              Paid to date: {settings.currency}{currentUser.paidAmount}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Transit Logistics Card Requested in Prompt: Route Name, Bus Number, Driver Name, Driver Phone, Pickup Stop, Pickup Time */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Daily Transit Logistics Summary</h3>
              <p className="text-xs text-slate-500">Live GPS tracking simulator & driver contact point</p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-xl">
            {bs?.busNumber || 'BUS-101'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
            <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Allocated Route Name
            </span>
            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {rt?.name || 'Standard Transit Corridor'}
            </div>
            <div className="text-[11px] text-slate-500 truncate">{rt?.description}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
            <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" /> Pickup Stop & Timing
            </span>
            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {sp?.stopName || 'Campus Main Gate'}
            </div>
            <div className="font-mono text-emerald-600 font-black text-xs">
              ⚡ {sp?.pickupTime || '07:30 AM'} SHARP
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-1 sm:col-span-2 lg:col-span-1">
            <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" /> Designated Bus Driver
            </span>
            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {bs?.driverName || 'Rajesh Verma'}
            </div>
            <a 
              href={`tel:${bs?.driverPhone}`}
              className="font-mono text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 mt-1"
            >
              <Phone className="w-3 h-3" /> {bs?.driverPhone || '+1 (555) 381-9921'}
            </a>
          </div>

        </div>
      </div>

    </div>
  );
};
