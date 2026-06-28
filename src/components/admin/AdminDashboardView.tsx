import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, CreditCard, AlertTriangle, Bus, MapPin, TrendingUp, 
  UserPlus, UploadCloud, ArrowUpRight, DollarSign, CheckCircle2 
} from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';

export const AdminDashboardView: React.FC = () => {
  const { students, buses, routes, payments, setAdminTab, settings } = useApp();

  const totalStudents = students.length;
  const paidStudents = students.filter(s => s.status === 'paid').length;
  const pendingStudents = students.filter(s => s.status === 'pending' || s.status === 'partial').length;

  const totalRoutes = routes.length;
  const totalBuses = buses.length;
  const activeBuses = buses.filter(b => b.status === 'active').length;

  const totalCollected = payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0);
  const totalExpected = students.reduce((sum, s) => sum + s.term1Fee + s.term2Fee, 0);
  const totalPendingAmt = students.reduce((sum, s) => sum + s.pendingAmount, 0);

  // Today's collection simulation
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCollection = payments
    .filter(p => p.paymentDate.startsWith(todayStr))
    .reduce((sum, p) => sum + p.amount, 0);

  // Class wise collection data
  const classMap: Record<string, { cls: string; collected: number; pending: number }> = {};
  students.forEach(s => {
    if (!classMap[s.class]) classMap[s.class] = { cls: `Class ${s.class}`, collected: 0, pending: 0 };
    classMap[s.class].collected += s.paidAmount;
    classMap[s.class].pending += s.pendingAmount;
  });
  const classChartData = Object.values(classMap).sort((a, b) => parseInt(a.cls.replace(/\D/g, '')) - parseInt(b.cls.replace(/\D/g, '')));

  // Pie chart status data
  const pieData = [
    { name: 'Paid Full', value: paidStudents, color: '#10B981' },
    { name: 'Pending / Partial', value: pendingStudents, color: '#F97316' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Metric Cards Row (Clean Minimalism Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Students</span>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-sans">{totalStudents}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> 100% Enrolled
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Collection</span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-mono">{settings.currency}{totalCollected.toLocaleString()}</span>
              <span className="text-xs text-slate-400">/ {settings.currency}{totalExpected.toLocaleString()}</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totalExpected ? Math.min(100, (totalCollected/totalExpected)*100) : 75}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-rose-500/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pending Dues</span>
              <div className="p-2 bg-rose-50 dark:bg-rose-950/60 rounded-xl text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">{settings.currency}{totalPendingAmt.toLocaleString()}</span>
              <span className="text-xs font-bold text-rose-500 bg-rose-100 dark:bg-rose-900/30 px-2 py-0.5 rounded-md">{pendingStudents} Students</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${totalExpected ? Math.min(100, (totalPendingAmt/totalExpected)*100) : 25}%` }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 md:p-6 rounded-3xl shadow-lg shadow-indigo-600/20 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Active Fleet</span>
              <Bus className="w-5 h-5 text-indigo-200" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black">{activeBuses} / {totalBuses}</span>
              <span className="text-xs text-indigo-200">Buses</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10 mt-3">
            <span>{totalRoutes} Transit Routes</span>
            <span className="font-semibold underline cursor-pointer" onClick={() => setAdminTab('buses')}>Manage Fleet</span>
          </div>
        </div>

      </div>

      {/* Quick Action Buttons Row */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Quick Shortcuts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setAdminTab('students')}
            className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl flex items-center gap-3 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all cursor-pointer group"
          >
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Add Student</div>
              <div className="text-[10px] text-slate-500">Manual Enrolment</div>
            </div>
          </button>

          <button
            onClick={() => setAdminTab('import')}
            className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-2xl flex items-center gap-3 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all cursor-pointer group"
          >
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Import Excel</div>
              <div className="text-[10px] text-slate-500">Bulk Validation</div>
            </div>
          </button>

          <button
            onClick={() => setAdminTab('buses')}
            className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-2xl flex items-center gap-3 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all cursor-pointer group"
          >
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform">
              <Bus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Add Bus / Route</div>
              <div className="text-[10px] text-slate-500">Fleet Allocation</div>
            </div>
          </button>

          <button
            onClick={() => setAdminTab('pending')}
            className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 rounded-2xl flex items-center gap-3 hover:bg-amber-100 dark:hover:bg-amber-900 transition-all cursor-pointer group"
          >
            <div className="p-2.5 bg-amber-600 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Send Reminders</div>
              <div className="text-[10px] text-slate-500">WhatsApp Dispatch</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Bar Chart: Class wise Collection */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Class-wise Fee Analytics</h3>
              <p className="text-xs text-slate-500">Comparing Collected vs. Pending bus fees per grade</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              Term 1 & 2
            </span>
          </div>

          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="cls" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={val => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="collected" name="Collected Fee" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="pending" name="Pending Dues" fill="#f97316" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Payment Status Distribution */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Fee Payment Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Ratio of paid vs pending accounts</p>
          </div>

          <div className="h-[220px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block" /> Paid Accounts
              </span>
              <span>{paidStudents} ({totalStudents ? Math.round((paidStudents/totalStudents)*100) : 0}%)</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-2 text-orange-500">
                <span className="w-3 h-3 bg-orange-500 rounded-full inline-block" /> Pending Accounts
              </span>
              <span>{pendingStudents} ({totalStudents ? Math.round((pendingStudents/totalStudents)*100) : 0}%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Payments Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Fee Collections</h3>
            <p className="text-xs text-slate-500">Latest online and cash bus fee receipts</p>
          </div>
          <button
            onClick={() => setAdminTab('payments')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All Payments <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Receipt #</th>
                <th className="px-6 py-3.5">Class/Sec</th>
                <th className="px-6 py-3.5">Term</th>
                <th className="px-6 py-3.5">Method</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {payments.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px]">
                      {p.studentName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div>{p.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.studentId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">{p.receiptNumber}</td>
                  <td className="px-6 py-4 font-medium">{p.classSection}</td>
                  <td className="px-6 py-4 uppercase font-bold text-slate-600 dark:text-slate-300">{p.term}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                      {p.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    +{settings.currency}{p.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
