import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolSettings } from '../../types';
import { Settings as SettingsIcon, Save, RefreshCw, ShieldAlert, Building } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToSeedData, addToast } = useApp();
  const [formData, setFormData] = useState<SchoolSettings>(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">System Configuration</h2>
          <p className="text-xs text-slate-500 mt-1">Manage school metadata, currency symbol, and demo state reset</p>
        </div>
        <Building className="w-8 h-8 text-indigo-600 hidden sm:block" />
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border shadow-xs space-y-6 text-xs font-medium">
        <h3 className="text-sm font-bold border-b pb-3">General Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">School Institution Name</label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={e => setFormData({...formData, schoolName: e.target.value})}
              className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">Active Academic Session</label>
            <input
              type="text"
              required
              value={formData.academicYear}
              onChange={e => setFormData({...formData, academicYear: e.target.value})}
              className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">Currency Symbol</label>
            <input
              type="text"
              required
              value={formData.currency}
              onChange={e => setFormData({...formData, currency: e.target.value})}
              className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 font-mono text-center font-bold text-base"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-slate-600 dark:text-slate-400 mb-1">Support Contact Email</label>
            <input
              type="email"
              value={formData.supportEmail}
              onChange={e => setFormData({...formData, supportEmail: e.target.value})}
              className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-rose-50 dark:bg-rose-950/30 p-8 rounded-3xl border border-rose-200 dark:border-rose-900 space-y-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5" /> Reset Database to Factory Seed
          </div>
          <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1 max-w-md leading-relaxed">
            Restores original 12 demo students, 4 fleet buses, and default payment audit logs. Useful for testing edge cases.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all demo data? Any manual additions will be wiped.')) {
              resetToSeedData();
            }
          }}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Restore Demo Seed
        </button>
      </div>

    </div>
  );
};
