import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ReceiptModal } from '../common/ReceiptModal';
import { EmptyState } from '../common/EmptyState';
import { 
  CreditCard, ShieldCheck, Download, DollarSign, Clock, 
  CheckCircle2, AlertTriangle, Lock, Sparkles, X 
} from 'lucide-react';

export const StudentPaymentView: React.FC = () => {
  const { currentUser, payments, recordPayment, settings } = useApp();
  
  const [selectedTerm, setSelectedTerm] = useState<'term1' | 'term2' | 'both'>('both');
  const [selectedMethod, setSelectedMethod] = useState<'Card' | 'UPI' | 'NetBanking'>('Card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  if (!currentUser) return null;

  const myPayments = payments.filter(p => p.studentId === currentUser.studentId);
  
  const dueTerm1 = Math.max(0, currentUser.term1Fee - currentUser.paidAmount);
  const dueTerm2 = Math.max(0, (currentUser.term1Fee + currentUser.term2Fee) - currentUser.paidAmount);

  const calculatePayAmount = () => {
    if (selectedTerm === 'term1') return dueTerm1;
    if (selectedTerm === 'term2') return Math.max(0, currentUser.term2Fee);
    return currentUser.pendingAmount;
  };

  const handleExecuteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = calculatePayAmount();
    if (amt <= 0) {
      alert('Selected term is already completely settled!');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const mappedMethod = selectedMethod === 'Card' ? 'Online Card' : selectedMethod === 'NetBanking' ? 'Net Banking' : 'UPI';
      recordPayment(currentUser.studentId, amt, selectedTerm, mappedMethod);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Online Fee Payment Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Settle your school transport dues securely with simulated instant receipt generation.
          </p>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-2xl">
          <CreditCard className="w-8 h-8" />
        </div>
      </div>

      {/* Grid: Payment Form vs Dues Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Payment Selection */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border shadow-xs space-y-6">
          <h3 className="font-bold text-base border-b pb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-500" /> Choose Fee Installment Term
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSelectedTerm('both')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${selectedTerm === 'both' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600' : 'hover:bg-slate-50'}`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-400">Full Academic Year</div>
              <div className="font-black text-slate-900 dark:text-white text-base mt-1">Both Terms</div>
              <div className="font-mono text-xs text-indigo-600 font-bold mt-2">${currentUser.pendingAmount} Due</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTerm('term1')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${selectedTerm === 'term1' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600' : 'hover:bg-slate-50'}`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-400">Installment 1</div>
              <div className="font-black text-slate-900 dark:text-white text-base mt-1">Term 1 Fee</div>
              <div className="font-mono text-xs text-emerald-600 font-bold mt-2">${currentUser.term1Fee}</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTerm('term2')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${selectedTerm === 'term2' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600' : 'hover:bg-slate-50'}`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-400">Installment 2</div>
              <div className="font-black text-slate-900 dark:text-white text-base mt-1">Term 2 Fee</div>
              <div className="font-mono text-xs text-blue-600 font-bold mt-2">${currentUser.term2Fee}</div>
            </button>
          </div>

          <div className="pt-4 space-y-4">
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Simulated Payment Channel</h3>
            <div className="flex gap-3">
              {(['Card', 'UPI', 'NetBanking'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSelectedMethod(mode)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex-1 cursor-pointer transition-all ${selectedMethod === mode ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
                >
                  {mode === 'Card' ? '💳 Credit/Debit Card' : mode === 'UPI' ? '⚡ UPI Scan' : '🏦 Net Banking'}
                </button>
              ))}
            </div>
          </div>

          {/* Checkout Button */}
          <div className="pt-6 border-t">
            {currentUser.pendingAmount === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> All annual transport dues are settled! No payment required.
              </div>
            ) : (
              <button
                onClick={handleExecuteCheckout}
                disabled={isProcessing || calculatePayAmount() === 0}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>Processing Encrypted Transaction...</>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Authorize & Pay {settings.currency}{calculatePayAmount()} Now
                  </>
                )}
              </button>
            )}
            <p className="text-[10px] text-slate-400 text-center mt-2.5 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secured 256-bit simulated gateway handshake
            </p>
          </div>
        </div>

        {/* Right Col: Account Due Ledger */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Account Fee Ledger</h4>
            
            <div className="space-y-3 text-xs font-medium">
              <div className="flex justify-between pb-2 border-b">
                <span className="text-slate-500">Term 1 Fee</span>
                <span className="font-mono">${currentUser.term1Fee}</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="text-slate-500">Term 2 Fee</span>
                <span className="font-mono">${currentUser.term2Fee}</span>
              </div>
              <div className="flex justify-between pb-2 border-b text-emerald-600 font-bold">
                <span>Total Settled Paid</span>
                <span className="font-mono">-${currentUser.paidAmount}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-black text-rose-600 dark:text-rose-400">
                <span>Outstanding Due</span>
                <span className="font-mono">{settings.currency}{currentUser.pendingAmount}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Need Help?</span>
            <p>If you have already paid at the school finance counter and don't see your balance updated, contact accounts.</p>
          </div>
        </div>

      </div>

      {/* Payment History Table Requested in Prompt: Payment History, Download Receipt */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border shadow-xs space-y-6">
        <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
          <Clock className="w-5 h-5 text-indigo-500" /> My Verified Payment History
        </h3>

        {myPayments.length === 0 ? (
          <EmptyState title="No Past Receipts Generated Yet" description="Once you settle any fee installments, official printable PDF receipts will appear here." />
        ) : (
          <div className="space-y-3">
            {myPayments.map((pay) => (
              <div key={pay.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-emerald-500 text-white font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {pay.receiptNumber} • Paid via {pay.method}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(pay.paymentDate).toLocaleString()} • Term Allocation: <span className="uppercase font-bold text-indigo-500">{pay.term}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-mono font-black text-emerald-600 text-base">
                    +{settings.currency}{pay.amount}
                  </span>
                  <button
                    onClick={() => setActiveReceipt(pay)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />

    </div>
  );
};
