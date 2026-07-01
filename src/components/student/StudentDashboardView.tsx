import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bus, MapPin, Clock, Phone, User, CheckCircle2, 
  AlertTriangle, ArrowRight, ShieldCheck, CreditCard 
} from 'lucide-react';

export const StudentDashboardView: React.FC = () => {
  const { currentUser, routes, buses, stops, setStudentTab, settings, payments } = useApp();

  if (!currentUser) return null;

  const rt = routes.find(r => r.id === currentUser.routeId);
  const bs = buses.find(b => b.id === currentUser.busId);
  const sp = stops.find(s => s.id === currentUser.stopId);

  // Retrieve dates of payments for term 1 and term 2
  const studentPayments = payments ? payments.filter(p => 
    (p.studentId === currentUser.studentId || p.studentId === currentUser.id) && 
    (p.status?.toLowerCase() === 'completed')
  ) : [];

  const term1Payment = studentPayments.find(p => p.term === 'term1' || p.term === 'both');
  const term2Payment = studentPayments.find(p => p.term === 'term2' || p.term === 'both');

  const term1Paid = !!term1Payment;
  const term2Paid = !!term2Payment;

  const term1Date = term1Payment 
    ? new Date(term1Payment.paymentDate || (term1Payment as any).date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
    : null;

  const term2Date = term2Payment 
    ? new Date(term2Payment.paymentDate || (term2Payment as any).date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
    : null;

  const isFullyPaid = currentUser.pendingAmount <= 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Welcome Banner Card with elegant Medium Text */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-6 md:p-8 rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-indigo-500/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold tracking-wider">
            🚌 ROSTER NO: {currentUser.studentId}
          </div>
          <h2 className="text-xl md:text-3xl font-bold tracking-tight leading-tight">
            Hello, {currentUser.name}! 👋
          </h2>
          <p className="text-slate-350 text-sm md:text-base flex flex-wrap items-center gap-2 font-semibold">
            <span>Class {currentUser.class} • Section {currentUser.section}</span>
            <span className="hidden md:inline">•</span>
            <span className="text-indigo-300 font-bold bg-indigo-950/60 px-3 py-0.5 rounded-lg border border-indigo-800 text-xs">
              {settings.academicYear || '2026-2027'} Year
            </span>
          </p>
        </div>

        <div className="relative z-10 bg-slate-900/80 p-5 rounded-2xl border border-indigo-500/30 text-left md:text-right shrink-0 w-full md:w-auto min-w-[240px] shadow-md">
          <span className="text-xs uppercase font-bold text-indigo-300 block tracking-widest">PENDING BALANCE TO PAY</span>
          <span className="text-2xl md:text-3xl font-mono font-black text-amber-400 block mt-1">
            {settings.currency}{currentUser.pendingAmount}
          </span>
          {currentUser.pendingAmount > 0 ? (
            <button
              onClick={() => setStudentTab('payment')}
              className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              Pay My Fees Now <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="mt-4 w-full py-2 bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-450" /> ALL FEES COMPLETED!
            </div>
          )}
        </div>
      </div>

      {/* Quick Cards with elegant Medium Labels */}
      <div className={`grid grid-cols-1 ${isFullyPaid ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
        
        {/* Card 1: Term 1 Status */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between hover:scale-[1.01] transition-transform">
          <div className="space-y-3">
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-widest block">Term 1 Fees</span>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
              {settings.currency}{currentUser.term1Fee}
            </div>
            <div className="pt-1">
              {term1Paid ? (
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold self-start border border-emerald-300/40">
                    <CheckCircle2 className="w-4 h-4" /> PAID FULL ✅
                  </span>
                  {term1Date && (
                    <span className="text-xs font-semibold text-slate-500 block mt-1">
                      Date Paid: {term1Date}
                    </span>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-bold border border-rose-300/40">
                  <AlertTriangle className="w-4 h-4" /> NOT PAID YET ❌
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${term1Paid ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950' : 'bg-rose-50 text-rose-600 dark:bg-rose-950'}`}>
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>

        {/* Card 2: Term 2 Status */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between hover:scale-[1.01] transition-transform">
          <div className="space-y-3">
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-widest block">Term 2 Fees</span>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
              {settings.currency}{currentUser.term2Fee}
            </div>
            <div className="pt-1">
              {term2Paid ? (
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold self-start border border-emerald-300/40">
                    <CheckCircle2 className="w-4 h-4" /> PAID FULL ✅
                  </span>
                  {term2Date && (
                    <span className="text-xs font-semibold text-slate-500 block mt-1">
                      Date Paid: {term2Date}
                    </span>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-bold border border-rose-300/40">
                  <AlertTriangle className="w-4 h-4" /> NOT PAID YET ❌
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${term2Paid ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950' : 'bg-rose-50 text-rose-600 dark:bg-rose-950'}`}>
            <CreditCard className="w-8 h-8" />
          </div>
        </div>

        {/* Card 3: Net Pending Amount Summary */}
        {!isFullyPaid && (
          <div className="bg-rose-50/50 dark:bg-rose-950/20 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-sm flex items-center justify-between hover:scale-[1.01] transition-transform">
            <div className="space-y-3">
              <span className="text-rose-800 dark:text-rose-300 text-xs uppercase font-bold tracking-widest block">Net Pending Amount</span>
              <div className="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400">
                {settings.currency}{currentUser.pendingAmount}
              </div>
              <div className="text-xs font-semibold text-slate-500 block mt-1">
                Total paid till now: {settings.currency}{currentUser.paidAmount}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
          </div>
        )}

      </div>

      {/* Transit Logistics Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
              <Bus className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug">My School Bus Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pickup, drop and driver phone number listed below</p>
            </div>
          </div>
          <span className="font-mono text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-900 px-4 py-2 rounded-xl shadow-inner shrink-0">
            🚌 BUS NUMBER: {bs?.busNumber || 'BUS-101'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <span className="text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold text-xs flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-500 shrink-0" /> ROUTE NAME / AREA
            </span>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {rt?.name || 'Standard Transit Corridor'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{rt?.description}</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <span className="text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0" /> BUS STOP & TIME
            </span>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {sp?.stopName || 'Campus Main Gate'}
            </div>
            <div className="font-mono text-emerald-800 dark:text-emerald-350 font-bold text-xs mt-1 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-300/40 inline-block">
              🕒 {sp?.pickupTime || '07:30 AM'} MORNING SHARP
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2 sm:col-span-2 lg:col-span-1">
            <span className="text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold text-xs flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-500 shrink-0" /> BUS DRIVER NAME
            </span>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {bs?.driverName || 'Rajesh Verma'}
            </div>
            <a 
              href={`tel:${bs?.driverPhone}`}
              className="mt-2 w-full py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              📞 CALL DRIVER: {bs?.driverPhone || '+1 (555) 381-9921'}
            </a>
          </div>

        </div>
      </div>

    </div>
  );
};
