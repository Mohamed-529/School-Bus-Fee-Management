import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminActiveTab } from '../../types';
import { 
  LayoutDashboard, Users, UploadCloud, CreditCard, AlertCircle, 
  Bus, MapPin, FileSpreadsheet, Settings, LogOut, Sun, Moon, 
  Search, Bell, Menu, X, ShieldAlert 
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { 
    adminTab, setAdminTab, logout, darkMode, toggleDarkMode, 
    currentUser, students, switchDemoRole, settings,
    selectedAcademicYear, setSelectedAcademicYear
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');

  const pendingCount = students.filter(s => s.status === 'pending' || s.status === 'partial').length;

  const navItems: Array<{ id: AdminActiveTab; label: string; icon: any; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'import', label: 'Bulk Import Excel', icon: UploadCloud },
    { id: 'payments', label: 'Fee Payments', icon: CreditCard },
    { id: 'pending', label: 'Pending Dues', icon: AlertCircle, badge: pendingCount },
    { id: 'buses', label: 'Fleet & Buses', icon: Bus },
    { id: 'reports', label: 'Analytics & Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'School Settings', icon: Settings },
  ];

  const handleNavClick = (tab: AdminActiveTab) => {
    setAdminTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col shrink-0 z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/20 shrink-0">
            <Bus className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <span className="font-extrabold text-lg tracking-tight block truncate text-slate-900 dark:text-white">
              {settings.schoolName.split(' ')[0] || 'TransTrack'}
            </span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider block">
              Admin Portal
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between text-xs font-semibold transition-all duration-150 cursor-pointer ${active ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-indigo-600 text-white' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleDarkMode}
              className="w-full p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{currentUser?.name || 'Transport Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{settings.academicYear}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-18 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div>
              <h1 className="text-base md:text-xl font-bold text-slate-900 dark:text-white capitalize">
                {navItems.find(n => n.id === adminTab)?.label || 'Dashboard Overview'}
              </h1>
              <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400">
                {settings.schoolName} • Transport Fee Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Academic Year Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Session:</span>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-hidden cursor-pointer p-0 select-none"
              >
                <option value="2024 - 2025" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">2024-25</option>
                <option value="2025 - 2026" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">2025-26</option>
                <option value="2026 - 2027" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">2026-27</option>
              </select>
            </div>

            <button
              onClick={() => setAdminTab('pending')}
              className="relative p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
              title="Pending Reminders Notices"
            >
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              )}
            </button>

            <button
              onClick={toggleDarkMode}
              className="lg:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Mobile Slideout Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white dark:bg-slate-900 h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5 font-bold text-lg text-slate-900 dark:text-white">
                  <Bus className="w-6 h-6 text-indigo-600" />
                  <span>TransTrack</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {navItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold ${adminTab === item.id ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <button onClick={logout} className="text-xs text-rose-600 font-bold flex items-center gap-1.5">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable View Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950 pb-24 md:pb-8">
          {children}
        </div>

        {/* Mobile React Native Style Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around z-30 shadow-lg">
          <button
            onClick={() => setAdminTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl ${adminTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>
          <button
            onClick={() => setAdminTab('students')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl ${adminTab === 'students' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Students</span>
          </button>
          <button
            onClick={() => setAdminTab('payments')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl ${adminTab === 'payments' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px]">Fees</span>
          </button>
          <button
            onClick={() => setAdminTab('pending')}
            className={`relative flex flex-col items-center gap-1 p-1.5 rounded-xl ${adminTab === 'pending' ? 'text-rose-600 font-bold' : 'text-slate-400'}`}
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-[10px]">Pending</span>
            {pendingCount > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setAdminTab('buses')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl ${adminTab === 'buses' || adminTab === 'routes' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            <Bus className="w-5 h-5" />
            <span className="text-[10px]">Fleet</span>
          </button>
        </div>

      </main>
    </div>
  );
};
