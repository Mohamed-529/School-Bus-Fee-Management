import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, LogOut, KeyRound, CheckCircle2 } from 'lucide-react';

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
      
      <div className="bg-white dark:bg-slate-900 rounded-3xl border p-8 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Account Settings</h2>
          <p className="text-xs text-slate-500 mt-1">Manage portal password security & session controls</p>
        </div>
        <KeyRound className="w-8 h-8 text-indigo-600 hidden sm:block" />
      </div>

      {/* Change Password Requested in Prompt */}
      <form onSubmit={handlePasswordChange} className="bg-white dark:bg-slate-900 rounded-3xl border p-8 shadow-xs space-y-5 text-xs font-medium">
        <h3 className="text-sm font-bold border-b pb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-500" /> Update Student Portal Password
        </h3>

        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
          <input
            type="password"
            required
            value={oldPass}
            onChange={e => setOldPass(e.target.value)}
            placeholder="••••••••"
            className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
          >
            Update Security Credentials
          </button>
        </div>
      </form>

      {/* Logout Card */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base">Terminate Portal Session</h3>
          <p className="text-xs text-slate-400 mt-0.5">Safely sign out from this active student device</p>
        </div>
        <button
          onClick={logout}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Logout Now
        </button>
      </div>

    </div>
  );
};
