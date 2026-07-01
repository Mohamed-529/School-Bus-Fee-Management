import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, LogOut, KeyRound } from 'lucide-react';

export const StudentSettingsView: React.FC = () => {
  const { currentUser, updateStudent, logout, addToast } = useApp();
  
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  if (!currentUser) return null;

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass !== confirmPass) {
      addToast('Password Mismatch', 'error', 'New password and confirmation do not match');
      return;
    }
    
    // Update student password
    updateStudent(currentUser.id, { password: newPass });
    addToast('Password Updated!', 'success', 'Your login credentials have been changed securely.');
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Title block with larger text */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border p-8 shadow-xs flex justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Account Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Manage portal password security & session controls</p>
        </div>
        <KeyRound className="w-10 h-10 text-indigo-600 hidden sm:block shrink-0" />
      </div>

      {/* Change Password with highly readable input fields and labels */}
      <form onSubmit={handlePasswordChange} className="bg-white dark:bg-slate-900 rounded-3xl border p-8 shadow-xs space-y-6 text-sm font-bold">
        <h3 className="text-base md:text-lg font-extrabold border-b pb-3 flex items-center gap-2 text-slate-900 dark:text-white">
          <Lock className="w-5 h-5 text-indigo-500" /> Update Student Portal Password
        </h3>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-extrabold text-sm">Current Password</label>
          <input
            type="password"
            required
            value={oldPass}
            onChange={e => setOldPass(e.target.value)}
            placeholder="••••••••"
            className="w-full p-4 rounded-xl border bg-slate-50 dark:bg-slate-800 text-base"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-extrabold text-sm">New Password</label>
            <input
              type="password"
              required
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 rounded-xl border bg-slate-50 dark:bg-slate-800 text-base"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-extrabold text-sm">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 rounded-xl border bg-slate-50 dark:bg-slate-800 text-base"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-md cursor-pointer transition-all active:scale-98"
          >
            Update Security Credentials
          </button>
        </div>
      </form>

      {/* Logout Card with larger fonts and action button */}
      <div className="bg-slate-900 text-white p-8 md:p-10 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div>
          <h3 className="font-black text-lg md:text-xl">Terminate Portal Session</h3>
          <p className="text-sm text-slate-400 mt-1 font-medium">Safely sign out from this active student device</p>
        </div>
        <button
          onClick={logout}
          className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98"
        >
          <LogOut className="w-5 h-5" /> Logout Now
        </button>
      </div>

    </div>
  );
};
