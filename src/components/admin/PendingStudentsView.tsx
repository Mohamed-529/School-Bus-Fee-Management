import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { Phone, MessageCircle, Copy, Check, Send, AlertCircle, Filter, Bus } from 'lucide-react';

export const PendingStudentsView: React.FC = () => {
  const { students, routes, addToast, settings } = useApp();
  
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterRoute, setFilterRoute] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Show ONLY pending students as requested in prompt: "Show only Pending Students"
  const pendingStudentsList = useMemo(() => {
    return students.filter(st => {
      const hasDue = st.status === 'pending' || st.status === 'partial' || st.pendingAmount > 0;
      const matchCls = filterClass === 'ALL' || st.class === filterClass;
      const matchRt = filterRoute === 'ALL' || st.routeId === filterRoute;
      return hasDue && matchCls && matchRt;
    });
  }, [students, filterClass, filterRoute]);

  const uniqueClasses = Array.from(new Set(students.map(s => s.class))).sort((a, b) => Number(a) - Number(b));

  const generateReminderMessage = (st: any) => {
    return `Dear ${st.parentName}, gentle reminder from ${settings.schoolName} Transport Dept. Your ward ${st.name} (ID: ${st.studentId}) has a pending bus fee due of ${settings.currency}${st.pendingAmount} for the academic year ${settings.academicYear}. Kindly settle via our online portal or school finance counter. Thank you!`;
  };

  const handleWhatsApp = (st: any) => {
    const msg = encodeURIComponent(generateReminderMessage(st));
    const phone = st.parentPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    addToast('WhatsApp Opened', 'success', `Reminder formatted for ${st.parentName}`);
  };

  const handleCopyReminder = (st: any) => {
    navigator.clipboard.writeText(generateReminderMessage(st));
    setCopiedId(st.id);
    addToast('Reminder Text Copied', 'info', 'Message copied to clipboard');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleBulkDispatch = () => {
    addToast('Bulk Notice Dispatched!', 'success', `Dispatched digital fee reminder notices to all ${pendingStudentsList.length} parents in queue.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-300" /> Action Required Queue
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Pending Fee Reminders Control
          </h2>
          <p className="text-rose-100 text-xs mt-1 max-w-xl leading-relaxed">
            Directly connect with parents via WhatsApp API simulation or telephone call to expedite transport collection targets.
          </p>
        </div>

        <button
          onClick={handleBulkDispatch}
          disabled={pendingStudentsList.length === 0}
          className="px-6 py-3.5 bg-white text-rose-700 hover:bg-rose-50 font-black rounded-2xl text-xs shadow-lg transition-all active:scale-95 shrink-0 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" /> Dispatch Bulk Reminder ({pendingStudentsList.length})
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border flex flex-wrap gap-4 items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Filter className="w-4 h-4" /> Filter Due Rosters:
        </div>
        <div className="flex gap-3">
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
          >
            <option value="ALL">All Classes</option>
            {uniqueClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>

          <select
            value={filterRoute}
            onChange={e => setFilterRoute(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold max-w-[160px] truncate"
          >
            <option value="ALL">All Transit Routes</option>
            {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      {/* Pending Student List Cards */}
      {pendingStudentsList.length === 0 ? (
        <EmptyState 
          title="All Dues Settled!"
          description="Congratulations! There are no students currently overdue on their school bus fees matching this filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {pendingStudentsList.map((st) => {
            const rtName = routes.find(r => r.id === st.routeId)?.name || 'North City Express';
            return (
              <div
                key={st.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between hover:border-rose-300 transition-all space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3.5 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-black flex items-center justify-center text-base shrink-0">
                      {st.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{st.name}</h4>
                      <p className="font-mono text-xs text-slate-400">{st.studentId} • Class {st.class}-{st.section}</p>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 mt-0.5">
                        <Bus className="w-3 h-3" /> {rtName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Due</span>
                    <span className="text-xl font-mono font-black text-rose-600 dark:text-rose-400">
                      {settings.currency}{st.pendingAmount}
                    </span>
                  </div>
                </div>

                {/* Parent Contact Box */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between text-xs border">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Guardian</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{st.parentName}</span>
                  </div>
                  <div className="font-mono font-semibold text-slate-600 dark:text-slate-300">
                    {st.parentPhone}
                  </div>
                </div>

                {/* Buttons Requested in Prompt: Call Parent, WhatsApp Parent, Copy Reminder */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <a
                    href={`tel:${st.parentPhone}`}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-500" /> Call
                  </a>

                  <button
                    onClick={() => handleWhatsApp(st)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>

                  <button
                    onClick={() => handleCopyReminder(st)}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    {copiedId === st.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === st.id ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
