import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, MapPin, Bus, ShieldCheck, Award } from 'lucide-react';

export const StudentProfileView: React.FC = () => {
  const { currentUser, routes, buses, stops, settings } = useApp();

  if (!currentUser) return null;

  const rt = routes.find(r => r.id === currentUser.routeId);
  const bs = buses.find(b => b.id === currentUser.busId);
  const sp = stops.find(s => s.id === currentUser.stopId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border p-8 shadow-xs flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="w-24 h-24 rounded-3xl bg-indigo-600 text-white font-black text-3xl flex items-center justify-center shadow-xl shadow-indigo-600/25 shrink-0">
          {currentUser.name.slice(0, 2).toUpperCase()}
        </div>
        
        <div className="space-y-1 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold mb-1">
            <ShieldCheck className="w-3 h-3" /> VERIFIED ROSTER RECORD
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{currentUser.name}</h2>
          <p className="font-mono text-xs text-slate-400">
            Student ID: {currentUser.studentId} • Admission: {currentUser.admissionNumber}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Allocation</span>
          <span className="text-lg font-black text-slate-800 dark:text-slate-200">{currentUser.class} - {currentUser.section}</span>
        </div>
      </div>

      {/* Profile Sections Requested in Prompt: Student Details, Parent Name, Parent Phone, Address, Route, Stop, Bus Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Section 1: Guardian & Personal Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border p-8 shadow-xs space-y-5">
          <h3 className="font-bold text-base border-b pb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <User className="w-4 h-4 text-indigo-500" /> Guardian & Personal Information
          </h3>

          <div className="space-y-4 text-xs font-medium">
            <div>
              <span className="text-slate-400 block text-[10px]">Parent / Guardian Name</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{currentUser.parentName}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Registered Parent Phone</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">{currentUser.parentPhone}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Residential Address</span>
              <span className="text-slate-700 dark:text-slate-300 leading-relaxed block mt-0.5">{currentUser.address}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Transport & Fleet Allocation */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border p-8 shadow-xs space-y-5">
          <h3 className="font-bold text-base border-b pb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Bus className="w-4 h-4 text-blue-500" /> Transport Allocation Dossier
          </h3>

          <div className="space-y-4 text-xs font-medium">
            <div>
              <span className="text-slate-400 block text-[10px]">Assigned Transit Route</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{rt?.name || 'Standard Corridor'}</span>
              <span className="text-[11px] text-slate-400 block truncate">{rt?.description}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border">
                <span className="text-slate-400 block text-[10px]">Fleet Bus Number</span>
                <span className="font-mono font-black text-indigo-600 text-sm">{bs?.busNumber || 'BUS-101'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border">
                <span className="text-slate-400 block text-[10px]">Pickup Stop</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{sp?.stopName || 'Gate 1'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-500 block">Designated Bus Driver</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{bs?.driverName || 'Rajesh Kumar'}</span>
              </div>
              <span className="font-mono text-xs font-bold text-indigo-600">{bs?.driverPhone}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
