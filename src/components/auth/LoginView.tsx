import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { Bus, ShieldCheck, Eye, EyeOff, Lock, User, CheckSquare, Square, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, rememberMe, setRememberMe, addToast, settings } = useApp();
  const [role, setRole] = useState<Role>('admin');
  const [identifier, setIdentifier] = useState('admin@school.edu');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setIdentifier('admin@school.edu');
      setPassword('admin123');
    } else {
      setIdentifier('STU1001');
      setPassword('password123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      addToast('Validation Error', 'warning', 'Please enter both ID/Email and Password');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      login(identifier.trim(), password, role);
      setIsLoading(false);
    }, 450);
  };

  const handleForgotPass = () => {
    addToast('Password Recovery', 'info', `Recovery link dispatched to registered ${role === 'admin' ? 'Email' : 'Parent Phone'}. Demo pass: ${role === 'admin' ? 'admin123' : 'password123'}`);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      <div className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Left Side Branding Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center ring-1 ring-white/20 shadow-lg">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">TransTrack</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-100 text-[11px] font-semibold mb-4 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Enterprise Transport Portal
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4 leading-tight">
              Smart Bus Fee & Route Management
            </h2>
            <p className="text-indigo-100/80 text-xs leading-relaxed mb-6">
              Empowering transport officers and parents with automated route GPS simulation, instant due notices, and digital receipt verification.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2.5 text-xs text-indigo-100">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Role-Based Access Control (Admin & Student)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-indigo-100">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automated WhatsApp Fee Reminders</span>
            </div>
          </div>
        </div>

        {/* Right Side Login Form */}
        <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sign in to Portal</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your respective account role to continue
            </p>
          </div>

          {/* Role Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6 border border-slate-200/60 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${role === 'admin' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
              <ShieldCheck className="w-4 h-4" />
              Transport Officer
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${role === 'student' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
              <User className="w-4 h-4" />
              Student / Parent
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {role === 'admin' ? 'Admin Email / Username' : 'Student ID / Admission No'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={role === 'admin' ? 'admin@school.edu' : 'STU1001'}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPass}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 select-none cursor-pointer"
              >
                {rememberMe ? (
                  <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Remember this device</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-70 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as {role === 'admin' ? 'Admin' : 'Student'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" /> Demo Testing Credentials:
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              <button
                type="button"
                onClick={() => { handleRoleChange('admin'); }}
                className="p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-left hover:border-indigo-400 transition-colors"
              >
                <span className="font-sans font-bold text-indigo-600 block">Admin Mode</span>
                admin@school.edu / admin123
              </button>
              <button
                type="button"
                onClick={() => { handleRoleChange('student'); }}
                className="p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-left hover:border-indigo-400 transition-colors"
              >
                <span className="font-sans font-bold text-emerald-600 block">Student Mode</span>
                STU1001 / password123
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
