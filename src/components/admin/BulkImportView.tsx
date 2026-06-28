import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

export const BulkImportView: React.FC = () => {
  const { bulkImportStudents, addToast, settings } = useApp();
  
  const [rawText, setRawText] = useState(`STU2001, Rohan Gupta, 8, A, +15553344112, Green Meadows Gate 1, 600
STU2002, Tanya Verma, 9, B, +15559988221, Hill View Junction, 550
STU2003, Kabir Rao, 10, A, +15551122334, Ocean Drive Towers, 700
STU1001, Aarav Sharma, 10, A, +15551112233, Duplicate Testing Gate, 600`);

  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [parsedRows, setParsedRows] = useState<Array<any>>([]);
  const [validationErrors, setValidationErrors] = useState<Array<string>>([]);
  const [importStats, setImportStats] = useState<{ count: number; duplicates: number } | null>(null);

  const handleValidateAndPreview = () => {
    const lines = rawText.trim().split('\n');
    if (lines.length === 0 || !rawText.trim()) {
      addToast('Empty Input', 'warning', 'Please provide Excel/CSV data or use sample text');
      return;
    }

    const rows: any[] = [];
    const errs: string[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 3) {
        errs.push(`Row ${idx + 1}: Missing required columns (Expected at least ID, Name, Class)`);
        return;
      }
      rows.push({
        studentId: parts[0],
        name: parts[1],
        class: parts[2] || '5',
        section: parts[3] || 'A',
        parentPhone: parts[4] || '+1 (555) 000-0000',
        address: parts[5] || 'School Bus Route Stop',
        term1Fee: Number(parts[6]) || 600,
        term2Fee: Number(parts[6]) || 600,
      });
    });

    setParsedRows(rows);
    setValidationErrors(errs);
    setStep('preview');
  };

  const handleExecuteImport = () => {
    const res = bulkImportStudents(parsedRows);
    if (res && res.success) {
      setImportStats({ count: res.count, duplicates: res.duplicates });
      setStep('result');
    }
  };

  const loadSampleExcelTemplate = () => {
    setRawText(`STU3001, Maya Lin, 6, A, +15556677881, Innovation Park Plaza, 700
STU3002, Ethan Hunt, 7, B, +15553322119, Metro Station North, 650
STU3003, Chloe Bennett, 10, C, +15554433228, Harbor Point Gate, 600
STU3004, Liam Smith, 5, A, +15558877665, Sunrise Park Circle, 500`);
    addToast('Sample Template Loaded', 'info', 'Loaded 4 valid Excel rows');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Bulk Roster Upload
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Import Students from Excel / CSV
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload exported CSV files or paste spreadsheet columns for automated validation and duplicate detection.
          </p>
        </div>
        <button
          onClick={loadSampleExcelTemplate}
          className="hidden sm:flex text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline items-center gap-1.5 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border"
        >
          Load Sample Data
        </button>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${step === 'upload' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 text-slate-500'}`}>
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
          Upload & Paste
        </div>
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${step === 'preview' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 text-slate-500'}`}>
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
          Preview & Validate
        </div>
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${step === 'result' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-900 text-slate-500'}`}>
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
          Import Summary
        </div>
      </div>

      {/* Step 1: Upload / Paste Text */}
      {step === 'upload' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-8 text-center bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/50 transition-colors cursor-pointer" onClick={loadSampleExcelTemplate}>
            <UploadCloud className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Click to Simulated File Browse or Paste Below</h3>
            <p className="text-xs text-slate-400 mt-1">Supports standard CSV format: StudentID, Name, Class, Section, Phone, Address, TermFee</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Raw Spreadsheet CSV Buffer
            </label>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full font-mono text-xs p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              placeholder="Paste Excel copied rows here..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleValidateAndPreview}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
            >
              Validate Spreadsheet Data <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preview & Validation Table */}
      {step === 'preview' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Validation Preview ({parsedRows.length} rows parsed)</h3>
            <button onClick={() => setStep('upload')} className="text-xs text-indigo-600 hover:underline font-bold">
              ← Edit Buffer
            </button>
          </div>

          {validationErrors.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" /> Column Validation Warning:
              </div>
              {validationErrors.map((err, i) => <div key={i}>• {err}</div>)}
            </div>
          )}

          <div className="overflow-x-auto border rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 font-bold uppercase text-[10px] text-slate-400">
                <tr>
                  <th className="p-3.5">Student ID</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Class/Sec</th>
                  <th className="p-3.5">Parent WhatsApp</th>
                  <th className="p-3.5">Fee Dues</th>
                  <th className="p-3.5">Status Check</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold">{row.studentId}</td>
                    <td className="p-3.5 font-semibold">{row.name}</td>
                    <td className="p-3.5">{row.class}-{row.section}</td>
                    <td className="p-3.5 font-mono text-emerald-600">{row.parentPhone}</td>
                    <td className="p-3.5 font-mono">${row.term1Fee + row.term2Fee}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                        READY
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-4">
            <span className="text-xs text-slate-400">Automatic duplicate rejection enabled</span>
            <div className="flex gap-3">
              <button onClick={() => setStep('upload')} className="px-5 py-2.5 rounded-xl border text-xs font-semibold">
                Cancel
              </button>
              <button
                onClick={handleExecuteImport}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm Bulk Enrolment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Success Report */}
      {step === 'result' && importStats && (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Excel Roster Synchronized!</h3>
            <p className="text-xs text-slate-500 mt-1">
              All parsed student profiles have been indexed to the active transport directory.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
            <div>
              <div className="text-2xl font-black text-emerald-600 font-mono">+{importStats.count}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Successfully Imported</div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-500 font-mono">{importStats.duplicates}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Duplicates Skipped</div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => { setStep('upload'); }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Upload Another File
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
