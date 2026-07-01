import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, MapPin, Bus, ShieldCheck } from 'lucide-react';

export const StudentProfileView: React.FC = () => {
  const { currentUser, routes, buses, stops } = useApp();

  if (!currentUser) return null;

  const rt = routes.find(r => r.id === currentUser.routeId);
  const bs = buses.find(b => b.id === currentUser.busId);
  const sp = stops.find(s => s.id === currentUser.stopId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Profile Card with larger sizes */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border p-8 md:p-10 shadow-xs flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="w-28 h-28 rounded-3xl bg-indigo-600 text-white font-black text-4xl flex items-center justify-center shadow-xl shadow-indigo-600/25 shrink-0">
          {currentUser.name.slice(0, 2).toUpperCase()}
        </div>
        
        <div className="space-y-2 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED ROSTER RECORD
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            {currentUser.name}
          </h2>
          <p className="font-mono text-sm font-semibold text-slate-500 dark:text-slate-450">
            Student ID: {currentUser.studentId} • Admission No: {currentUser.admissionNumber}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-center shrink-0 min-w-[140px]">
          <span className="text-xs uppercase font-extrabold text-slate-450 block mb-1">Class Allocation</span>
          <span className="text-xl md:text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {currentUser.class} - {currentUser.section}
          </span>
        </div>
      </div>

      {/* Profile Sections: Student Details, Parent Name, Parent Phone, Address, Route, Stop, Bus Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Section 1: Guardian & Personal Details with highly readable, larger text */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border p-8 shadow-xs space-y-6">
          <h3 className="font-extrabold text-lg md:text-xl border-b pb-3 flex items-center gap-2 text-slate-900 dark:text-white">
            <User className="w-5 h-5 text-indigo-500" /> Guardian & Personal Details
          </h3>

          <div className="space-y-5 font-bold">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase tracking-wider mb-1">Parent / Guardian Name</span>
              <span className="font-black text-slate-900 dark:text-slate-100 text-base md:text-lg">{currentUser.parentName}</span>
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase tracking-wider mb-1">Registered Phone Number</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-450 text-base md:text-lg">{currentUser.parentPhone}</span>
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase tracking-wider mb-1">Residential Home Address</span>
              <span className="text-slate-700 dark:text-slate-200 text-sm md:text-base leading-relaxed block mt-1">{currentUser.address}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Transport & Fleet Allocation with highly readable, larger text */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border p-8 shadow-xs space-y-6">
          <h3 className="font-extrabold text-lg md:text-xl border-b pb-3 flex items-center gap-2 text-slate-900 dark:text-white">
            <Bus className="w-5 h-5 text-blue-500" /> Transport Allocation Details
          </h3>

          <div className="space-y-5 font-bold">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase tracking-wider mb-1">Assigned Transit Route</span>
              <span className="font-black text-slate-900 dark:text-slate-100 text-base md:text-lg">{rt?.name || 'Standard Corridor'}</span>
              <span className="text-xs md:text-sm text-slate-400 block truncate font-medium mt-1">{rt?.description}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border">
                <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase mb-1">Fleet Bus Number</span>
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-base md:text-lg">{bs?.busNumber || 'BUS-101'}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border">
                <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase mb-1">Pickup Stop Location</span>
                <span className="font-black text-slate-800 dark:text-slate-200 text-base truncate block">{sp?.stopName || 'Gate 1'}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold uppercase text-indigo-550 dark:text-indigo-400 block">Designated Bus Driver</span>
                <span className="font-black text-slate-800 dark:text-slate-200 text-base md:text-lg">{bs?.driverName || 'Rajesh Kumar'}</span>
              </div>
              <a 
                href={`tel:${bs?.driverPhone}`}
                className="font-mono text-sm md:text-base font-extrabold text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                📞 CALL {bs?.driverPhone}
              </a>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
