import React from 'react';
import { useApp } from '../../context/AppContext';
import { StudentActiveTab } from '../../types';
import { LayoutDashboard, CreditCard, User, Settings, LogOut, Sun, Moon, Bus, ShieldCheck } from 'lucide-react';

export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    studentTab, setStudentTab, logout, darkMode, toggleDarkMode, 
    currentUser, routes, switchDemoRole, settings 
  } = useApp();

  const currentStudent = currentUser && currentUser.id !== 'admin' ? currentUser : null;
  const routeName = routes.find(r => r.id === currentStudent?.routeId)?.name || 'Assigned Bus Route';

  const navItems: Array<{ id: StudentActiveTab; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'payment', label: 'Fee & Receipt', icon: CreditCard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col pb-20 md:pb-0 transition-colors duration-300">
      
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-md">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base md:text-lg tracking-tight text-slate-900 dark:text-white">
                {settings.schoolName.split(' ')[0] || 'TransTrack'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase">
                Student
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px] md:max-w-md">
              {currentStudent ? `${currentStudent.name} (${currentStudent.studentId}) • Class ${currentStudent.class}-${currentStudent.section}` : 'Student Transit Portal'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => switchDemoRole('admin')}
            className="hidden md:flex text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900"
          >
            Simulate Admin Officer
          </button>

          <button
            onClick={logout}
            className="p-2 md:px-3.5 md:py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        {children}
      </main>

      {/* React Native Style Bottom Navigation for Student */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around z-40 shadow-lg md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = studentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setStudentTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-150 ${active ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Quick Nav Bar */}
      <div className="hidden md:flex justify-center border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 text-xs text-slate-500 gap-8">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setStudentTab(item.id)}
            className={`font-semibold hover:text-indigo-600 flex items-center gap-2 ${studentTab === item.id ? 'text-indigo-600 font-bold underline underline-offset-4' : ''}`}
          >
            <item.icon className="w-4 h-4" /> {item.label}
          </button>
        ))}
      </div>

    </div>
  );
};
