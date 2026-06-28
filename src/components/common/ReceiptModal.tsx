import React from 'react';
import { PaymentRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { Printer, Download, X, CheckCircle2, ShieldCheck, Bus } from 'lucide-react';

interface ReceiptModalProps {
  receipt: PaymentRecord | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const { settings, routes, students } = useApp();

  if (!receipt) return null;

  const st = students.find(s => s.studentId === receipt.studentId);
  const routeName = routes.find(r => r.id === st?.routeId)?.name || 'Standard School Route';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById('printable-receipt');
    if (!element) return;
    
    // Simulate instant PDF download action
    const content = `
======================================================
         ${settings.schoolName.toUpperCase()}
           OFFICIAL BUS FEE RECEIPT
======================================================
Receipt No   : ${receipt.receiptNumber}
Date         : ${new Date(receipt.paymentDate).toLocaleString()}
Student Name : ${receipt.studentName}
Student ID   : ${receipt.studentId}
Class/Sec    : ${receipt.classSection}
Route        : ${routeName}
------------------------------------------------------
Fee Term     : ${receipt.term.toUpperCase()}
Payment Method: ${receipt.method}
Amount Paid  : ${settings.currency}${receipt.amount.toFixed(2)}
Status       : ${receipt.status.toUpperCase()}
======================================================
Authorized Digital Signature
Thank you for timely payment!
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${receipt.receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Official Digital Receipt
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl text-slate-600 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Area */}
        <div id="printable-receipt" className="p-8 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
          <div className="text-center space-y-2 border-b border-dashed border-slate-200 dark:border-slate-700 pb-6">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mx-auto flex items-center justify-center">
              <Bus className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{settings.schoolName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Transport Department • Academic Year {settings.academicYear}</p>
          </div>

          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 p-4 rounded-2xl text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Payment Status</div>
                <div className="text-base font-bold">SUCCESSFULLY PAID</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-80">Receipt #</div>
              <div className="font-mono font-bold text-sm">{receipt.receiptNumber}</div>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Student Name</span>
              <span className="font-semibold text-slate-900 dark:text-white">{receipt.studentName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Student ID</span>
              <span className="font-mono font-medium">{receipt.studentId}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Class & Section</span>
              <span className="font-medium">{receipt.classSection}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Assigned Route</span>
              <span className="font-medium text-right max-w-[200px] truncate">{routeName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Fee Term</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">{receipt.term}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Payment Method</span>
              <span className="font-medium">{receipt.method}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Timestamp</span>
              <span className="font-mono text-xs">{new Date(receipt.paymentDate).toLocaleString()}</span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-700">
            <span className="font-bold text-slate-700 dark:text-slate-200">Total Amount Settled</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {settings.currency}{receipt.amount.toFixed(2)}
            </span>
          </div>

          <div className="text-center pt-2 text-xs text-slate-400 space-y-1">
            <p>This is a computer-generated receipt and requires no physical signature.</p>
            <p className="font-mono">{settings.supportEmail} • {settings.supportPhone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
