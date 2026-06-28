import React from 'react';
import { useApp } from '../../context/AppContext';
import { Download, FileSpreadsheet, PieChart, BarChart2, TrendingUp, DollarSign } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { students, payments, routes, addToast, settings } = useApp();

  const handleExportCSV = (reportType: string) => {
    let headers = 'StudentName,StudentID,Class,Route,PaidAmount,PendingAmount,Status\n';
    let rows = students.map(s => `${s.name},${s.studentId},${s.class}-${s.section},${routes.find(r => r.id === s.routeId)?.name || 'Standard'},${s.paidAmount},${s.pendingAmount},${s.status}`).join('\n');
    
    if (reportType === 'Payments') {
      headers = 'ReceiptNo,StudentName,Amount,Term,Method,Date\n';
      rows = payments.map(p => `${p.receiptNumber},${p.studentName},${p.amount},${p.term},${p.method},${p.paymentDate}`).join('\n');
    }

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_Report_${settings.academicYear.replace(/ /g, '')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast('Report Exported!', 'success', `Downloaded ${reportType} CSV spreadsheet`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Comprehensive Financial Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export CSV / PDF fee auditing reports categorized by class, route, and settlement timeline.
          </p>
        </div>
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-2xl text-indigo-600 hidden md:block">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-2xl text-emerald-600 w-fit mb-3 font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base">Collection Settlement Report</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete index of all settled Term 1 and Term 2 receipts with payment mode timestamps.
            </p>
          </div>
          <button
            onClick={() => handleExportCSV('Payments')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Receipts CSV
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950 rounded-2xl text-rose-600 w-fit mb-3 font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base">Pending Dues Deficit Roster</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Detailed list of all students currently overdue on their school transport fee obligations.
            </p>
          </div>
          <button
            onClick={() => handleExportCSV('Students_Pending')}
            className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Deficits CSV
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-2xl text-indigo-600 w-fit mb-3 font-bold">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base">Route & Class Allocation Matrix</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Full directory mapping students to assigned bus numbers, driver contacts, and stop pickup times.
            </p>
          </div>
          <button
            onClick={() => handleExportCSV('Master_Roster')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Master Roster
          </button>
        </div>

      </div>

    </div>
  );
};
