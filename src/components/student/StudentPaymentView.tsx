import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ReceiptModal } from '../common/ReceiptModal';
import { EmptyState } from '../common/EmptyState';
import { 
  CreditCard, ShieldCheck, Download, DollarSign, Clock, 
  CheckCircle2, AlertTriangle, Lock, Sparkles 
} from 'lucide-react';

export const StudentPaymentView: React.FC = () => {
  const { currentUser, payments, recordPayment, settings } = useApp();
  
  const [selectedTerm, setSelectedTerm] = useState<'term1' | 'term2' | 'both'>('both');
  const [selectedMethod, setSelectedMethod] = useState<'Card' | 'UPI' | 'NetBanking'>('Card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  if (!currentUser) return null;

  const myPayments = payments.filter(p => p.studentId === currentUser.studentId || p.studentId === currentUser.id);
  
  const isTerm1Paid = myPayments.some(p => p.term === 'term1' || p.term === 'both');
  const isTerm2Paid = myPayments.some(p => p.term === 'term2' || p.term === 'both');

  const dueTerm1 = isTerm1Paid ? 0 : currentUser.term1Fee;
  const dueTerm2 = isTerm2Paid ? 0 : currentUser.term2Fee;

  const calculatePayAmount = () => {
    if (selectedTerm === 'term1') return dueTerm1;
    if (selectedTerm === 'term2') return dueTerm2;
    return (isTerm1Paid ? 0 : currentUser.term1Fee) + (isTerm2Paid ? 0 : currentUser.term2Fee);
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
      
      {/* Title block with larger text */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border shadow-xs flex justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Online Fee Payment Center
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            Settle your school transport dues securely with simulated instant receipt generation.
          </p>
        </div>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-2xl shrink-0">
          <CreditCard className="w-10 h-10" />
        </div>
      </div>

      {/* Grid: Payment Form vs Dues Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Payment Selection */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border shadow-xs space-y-6">
          <h3 className="font-extrabold text-lg border-b pb-4 flex items-center gap-2 text-slate-900 dark:text-white">
            <Sparkles className="w-5 h-5 text-amber-500" /> Choose Fee Installment Term
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setSelectedTerm('both')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${selectedTerm === 'both' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600' : 'hover:bg-slate-50'}`}
            >
              <div className="text-xs uppercase font-extrabold text-slate-400">Full Academic Year</div>
              <div className="font-black text-slate-900 dark:text-white text-lg mt-1.5">Both Terms</div>
              <div className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-extrabold mt-2.5">
                {settings.currency}{currentUser.pendingAmount} Due
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTerm('term1')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${selectedTerm === 'term1' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600' : 'hover:bg-slate-50'}`}
            >
              <div className="text-xs uppercase font-extrabold text-slate-400">Installment 1</div>
              <div className="font-black text-slate-900 dark:text-white text-lg mt-1.5">Term 1 Fee</div>
              <div className="font-mono text-sm text-emerald-600 dark:text-emerald-450 font-extrabold mt-2.5">
                {settings.currency}{currentUser.term1Fee} Due
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTerm('term2')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${selectedTerm === 'term2' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600' : 'hover:bg-slate-50'}`}
            >
              <div className="text-xs uppercase font-extrabold text-slate-400">Installment 2</div>
              <div className="font-black text-slate-900 dark:text-white text-lg mt-1.5">Term 2 Fee</div>
              <div className="font-mono text-sm text-blue-600 dark:text-blue-400 font-extrabold mt-2.5">
                {settings.currency}{currentUser.term2Fee} Due
              </div>
            </button>
          </div>

          <div className="pt-4 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Simulated Payment Channel</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {(['Card', 'UPI', 'NetBanking'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSelectedMethod(mode)}
                  className={`px-4 py-3 rounded-xl border text-sm font-black flex-1 cursor-pointer transition-all ${selectedMethod === mode ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  {mode === 'Card' ? '💳 Credit/Debit Card' : mode === 'UPI' ? '⚡ UPI Scan QR' : '🏦 Net Banking'}
                </button>
              ))}
            </div>
          </div>

          {/* Checkout Button */}
          <div className="pt-6 border-t">
            {currentUser.pendingAmount === 0 ? (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-sm font-black text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> All annual transport dues are settled! No payment required.
              </div>
            ) : (
              <button
                onClick={handleExecuteCheckout}
                disabled={isProcessing || calculatePayAmount() === 0}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>Processing Encrypted Transaction...</>
                ) : (
                  <>
                    <Lock className="w-5 h-5" /> Authorize & Pay {settings.currency}{calculatePayAmount()} Now
                  </>
                )}
              </button>
            )}
            <p className="text-xs text-slate-400 text-center mt-3 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secured 256-bit simulated gateway handshake
            </p>
          </div>
        </div>

        {/* Right Col: Account Due Ledger */}
        <div className="bg-slate-50 dark:bg-slate-850/50 p-8 rounded-3xl border shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Account Fee Ledger</h4>
            
            <div className="space-y-4 text-sm font-bold">
              <div className="flex justify-between pb-2 border-b">
                <span className="text-slate-500">Term 1 Fee</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{settings.currency}{currentUser.term1Fee}</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="text-slate-500">Term 2 Fee</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{settings.currency}{currentUser.term2Fee}</span>
              </div>
              <div className="flex justify-between pb-2 border-b text-emerald-600 font-bold">
                <span>Total Settled Paid</span>
                <span className="font-mono">-{settings.currency}{currentUser.paidAmount}</span>
              </div>
              <div className="flex justify-between pt-2 text-lg font-black text-rose-600 dark:text-rose-400">
                <span>Outstanding Due</span>
                <span className="font-mono">{settings.currency}{currentUser.pendingAmount}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border text-xs text-slate-500 space-y-2 mt-4">
            <span className="font-extrabold text-slate-850 dark:text-slate-200 block">Need Help?</span>
            <p>If you have already paid at the school finance counter and don't see your balance updated, contact accounts.</p>
          </div>
        </div>

      </div>

      {/* Payment History Table with Larger Texts */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border shadow-xs space-y-6">
        <h3 className="font-extrabold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
          <Clock className="w-5.5 h-5.5 text-indigo-500" /> My Verified Payment History
        </h3>

        {myPayments.length === 0 ? (
          <EmptyState title="No Past Receipts Generated Yet" description="Once you settle any fee installments, official printable PDF receipts will appear here." />
        ) : (
          <div className="space-y-4">
            {myPayments.map((pay) => (
              <div key={pay.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-bold">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900 dark:text-white text-base">
                      {pay.receiptNumber} • Paid via {pay.method}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold">
                      {new Date(pay.paymentDate).toLocaleString()} • Term Allocation: <span className="uppercase font-black text-indigo-500">{pay.term}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-450 text-lg">
                    +{settings.currency}{pay.amount}
                  </span>
                  <button
                    onClick={() => setActiveReceipt(pay)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Receipt PDF
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
