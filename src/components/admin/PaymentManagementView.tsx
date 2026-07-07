import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ReceiptModal } from '../common/ReceiptModal';
import { EmptyState } from '../common/EmptyState';
import { 
  Search, Filter, CheckCircle2, AlertTriangle, Download, 
  DollarSign, Clock, ShieldCheck, UserCheck, X 
} from 'lucide-react';

export const PaymentManagementView: React.FC = () => {
  const { students, payments, markAsPaidAdmin, settings } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'pending' | 'paid'>('ALL');
  const [filterTerm, setFilterTerm] = useState<'all' | 'term1' | 'term2'>('all');
  
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [payModalStudent, setPayModalStudent] = useState<any | null>(null);
  const [payTerm, setPayTerm] = useState<'term1' | 'term2' | 'both'>('both');
  const [payMethod, setPayMethod] = useState<'Cash' | 'Online Card' | 'UPI' | 'Cheque'>('Cash');
  const [remarks, setRemarks] = useState('');

  // Dynamic pending & status helper based on real payments list
  const getDynamicPendingInfo = (st: any) => {
    const studentPayments = payments.filter(p => p.studentId === st.studentId && p.status === 'completed');
    const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalFees = (st.term1Fee || 0) + (st.term2Fee || 0);
    const pendingAmount = Math.max(0, totalFees - totalPaid);
    const isPaid = totalPaid >= totalFees && totalFees > 0;
    return { pendingAmount, isPaid, totalPaid };
  };

  // Helper functions to check payment status
  const isTerm1Paid = (studentId: string) => {
    return payments.some(p => p.studentId === studentId && (p.term === 'term1' || p.term === 'both'));
  };

  const isTerm2Paid = (studentId: string) => {
    return payments.some(p => p.studentId === studentId && (p.term === 'term2' || p.term === 'both'));
  };
 
  // Filtered Students with Dues
  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || st.name.toLowerCase().includes(q) || st.studentId.toLowerCase().includes(q);
      
      let matchFilter = true;
      const { isPaid, pendingAmount } = getDynamicPendingInfo(st);

      if (filterStatus === 'paid') {
        if (filterTerm === 'all') matchFilter = isPaid;
        else if (filterTerm === 'term1') matchFilter = isTerm1Paid(st.studentId);
        else if (filterTerm === 'term2') matchFilter = isTerm2Paid(st.studentId);
      } else if (filterStatus === 'pending') {
        if (filterTerm === 'all') matchFilter = !isPaid && pendingAmount > 0;
        else if (filterTerm === 'term1') matchFilter = !isTerm1Paid(st.studentId);
        else if (filterTerm === 'term2') matchFilter = !isTerm2Paid(st.studentId);
      }

      return matchSearch && matchFilter;
    });
  }, [students, payments, searchQuery, filterStatus, filterTerm]);
 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalStudent || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await markAsPaidAdmin(payModalStudent.studentId, payTerm, payMethod, remarks || 'Collected at Finance Counter');
      if (res && res.error) {
        alert(res.error);
      } else {
        setPayModalStudent(null);
      }
    } catch (err: any) {
      alert(err.message || 'Payment execution failed');
    } finally {
      setIsSubmitting(false);
    }
  };
 
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Student Name or ID for Fee settlement..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
 
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center">
          <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl text-xs font-semibold">
            {(['ALL', 'pending', 'paid'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setFilterStatus(tab);
                  if (tab === 'ALL') setFilterTerm('all');
                }}
                className={`px-3.5 py-2 rounded-xl capitalize transition-all cursor-pointer ${filterStatus === tab ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tab === 'ALL' ? 'All Directory' : tab === 'pending' ? 'Pending Dues' : 'Paid'}
              </button>
            ))}
          </div>

          {filterStatus !== 'ALL' && (
            <div className="flex flex-wrap gap-1.5 bg-indigo-50/50 dark:bg-indigo-900/10 p-1.5 rounded-2xl text-xs font-semibold border border-indigo-100/30">
              <span className="self-center text-[10px] uppercase font-bold text-indigo-500/80 px-2">By Term:</span>
              {(['all', 'term1', 'term2'] as const).map((termOption) => (
                <button
                  key={termOption}
                  onClick={() => setFilterTerm(termOption)}
                  className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${filterTerm === termOption ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                >
                  {termOption === 'all' ? 'Full Year' : termOption === 'term1' ? 'Term 1' : 'Term 2'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Roster Fee Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Fee Settlement Control Tower</h3>
          <span className="text-xs text-slate-400 font-mono">{filteredStudents.length} accounts listed</span>
        </div>

        {filteredStudents.length === 0 ? (
          <EmptyState title="No Payment Records Matching Search" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Term 1</th>
                  <th className="px-6 py-4">Term 2</th>
                  <th className="px-6 py-4">Total Due</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Instant Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {filteredStudents.map((st) => {
                  const { pendingAmount, isPaid } = getDynamicPendingInfo(st);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        <div>{st.name}</div>
                        <div className="font-mono text-[10px] text-slate-400">{st.studentId}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold">{st.class} - {st.section}</td>
                      <td className="px-6 py-4 font-mono">{settings.currency}{st.term1Fee}</td>
                      <td className="px-6 py-4 font-mono">{settings.currency}{st.term2Fee}</td>
                      <td className="px-6 py-4 font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                        {settings.currency}{pendingAmount}
                      </td>
                      <td className="px-6 py-4">
                        {isPaid ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            PAID FULL
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                            DUE PENDING
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {!isPaid && (
                          <button
                            onClick={() => { setPayModalStudent(st); setRemarks(''); }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                          >
                            Mark as Paid
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const foundPay = payments.find(p => p.studentId === st.studentId);
                            if (foundPay) setSelectedReceipt(foundPay);
                            else alert('No settled receipt history for this uncompleted account yet.');
                          }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-600"
                          title="Download Receipt"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Timeline Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="font-bold text-base mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" /> Historic Payment Audit Timeline
        </h3>
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500 text-white font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{p.studentName} ({p.receiptNumber})</div>
                  <div className="text-[10px] text-slate-400">{new Date(p.paymentDate).toLocaleString()} • {p.remarks}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-emerald-600 text-sm">+{settings.currency}{p.amount}</span>
                <button
                  onClick={() => setSelectedReceipt(p)}
                  className="px-3 py-1 bg-white dark:bg-slate-700 border rounded-lg hover:border-indigo-500 text-[10px] font-semibold"
                >
                  Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mark as Paid Modal */}
      {payModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border relative">
            <button onClick={() => setPayModalStudent(null)} className="absolute top-6 right-6 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Record Fee Collection</h3>
                <p className="text-xs text-slate-500">{payModalStudent.name} ({payModalStudent.studentId})</p>
              </div>
            </div>

            <form onSubmit={handleExecutePayment} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-500 mb-1">Fee Term Allocation</label>
                <select
                  value={payTerm}
                  onChange={e => setPayTerm(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                >
                  <option value="both">Both Terms (Full Year Due: {settings.currency}{getDynamicPendingInfo(payModalStudent).pendingAmount})</option>
                  <option value="term1">Term 1 Only ({settings.currency}{payModalStudent.term1Fee})</option>
                  <option value="term2">Term 2 Only ({settings.currency}{payModalStudent.term2Fee})</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Cash">Cash at School Counter</option>
                  <option value="UPI">UPI / GPay Scan</option>
                  <option value="Online Card">Card POS</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Audit Remarks (Optional)</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. Cheque No #882142"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
                >
                </input>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" disabled={isSubmitting} onClick={() => setPayModalStudent(null)} className="px-4 py-2 rounded-xl text-slate-500 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50">
                  {isSubmitting ? 'Processing...' : 'Confirm Settlement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />

    </div>
  );
};
