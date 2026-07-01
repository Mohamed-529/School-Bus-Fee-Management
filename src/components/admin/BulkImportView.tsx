import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Download } from 'lucide-react';

export const BulkImportView: React.FC = () => {
  const { bulkImportStudents, addToast, settings, routes, buses, stops, setAdminTab } = useApp();
  
  const [rawText, setRawText] = useState(`StudentID,StudentName,Class,Section,ParentName,ParentPhone,Term1Fee,Term2Fee,RouteName,BusNumber,StopName
ST-8-2001, Rohan Gupta, 8, A, Vijay Gupta, 9876543210, 600, 600, North City Express (Route A), BUS-101, Green Meadows Gate 1
ST-9-2002, Tanya Verma, 9, B, Sanjay Verma, 8877665544, 550, 550, South Bay Corridor (Route B), BUS-102, Ocean Drive Towers
ST-10-2003, Kabir Rao, 10, A, Mohan Rao, 7766554433, 700, 700, East Tech Hub (Route C), BUS-103, Silicon Avenue Gate 4
ST-10-1001, Aarav Sharma, 10, A, Ramesh Sharma, 9988776655, 600, 600, West Suburbs (Route D), BUS-104, Oakwood Heights Clubhouse`);

  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [parsedRows, setParsedRows] = useState<Array<any>>([]);
  const [validationErrors, setValidationErrors] = useState<Array<string>>([]);
  const [importStats, setImportStats] = useState<{ count: number; duplicates: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawText(text);
        addToast('File Loaded Successfully', 'success', `Loaded "${file.name}"`);
        validateAndPreviewText(text);
      }
    };
    reader.readAsText(file);
  };

  const validateAndPreviewText = (text: string) => {
    const lines = text.trim().split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      addToast('Empty Input', 'warning', 'Please provide Excel/CSV data or use sample text');
      return;
    }

    const rows: any[] = [];
    const errs: string[] = [];

    // Detect if first row is a header
    let hasHeader = false;
    let idIdx = 0;
    let nameIdx = 1;
    let classIdx = 2;
    let sectionIdx = 3;
    let parentNameIdx = 4;
    let phoneIdx = 5;
    let term1Idx = 6;
    let term2Idx = 7;
    let routeIdx = 8;
    let busIdx = 9;
    let stopIdx = 10;

    const firstLine = lines[0].toLowerCase();
    const firstLineParts = lines[0].split(',').map(s => s.trim().toLowerCase());

    // If first line contains common keywords, treat it as header row
    if (
      firstLineParts.some(h => 
        h.includes('id') || 
        h.includes('name') || 
        h.includes('class') || 
        h.includes('std') || 
        h.includes('section') || 
        h.includes('parent') || 
        h.includes('phone') || 
        h.includes('number') || 
        h.includes('term') || 
        h.includes('route') || 
        h.includes('bus') || 
        h.includes('stop') || 
        h.includes('pickup')
      )
    ) {
      hasHeader = true;
      firstLineParts.forEach((h, idx) => {
        if (h.includes('id') || h.includes('student')) idIdx = idx;
        else if (h.includes('studentname') || h === 'name' || h.includes('student name')) nameIdx = idx;
        else if (h.includes('class') || h === 'std' || h.includes('grade')) classIdx = idx;
        else if (h.includes('section') || h === 'sec') sectionIdx = idx;
        else if (h.includes('parentname') || h === 'parent' || h.includes('parent name') || h.includes('guardian')) parentNameIdx = idx;
        else if (h.includes('parentphone') || h === 'number' || h.includes('phone') || h.includes('whatsapp') || h.includes('parent phone')) phoneIdx = idx;
        else if (h.includes('term1') || h === 'term1fee' || h.includes('term 1')) term1Idx = idx;
        else if (h.includes('term2') || h === 'term2fee' || h.includes('term 2')) term2Idx = idx;
        else if (h.includes('route') || h === 'routes' || h.includes('routename') || h.includes('route name')) routeIdx = idx;
        else if (h.includes('bus') || h.includes('busnumber') || h.includes('bus number') || h === 'bus no') busIdx = idx;
        else if (h.includes('stop') || h.includes('pickup') || h.includes('point') || h.includes('stop name') || h.includes('stopname')) stopIdx = idx;
      });
    }

    const startIdx = hasHeader ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(',').map(s => s.trim());
      
      // Extract values based on indices or standard fallback
      const studentId = hasHeader ? (parts[idIdx] || '') : (parts[0] || '');
      const name = hasHeader ? (parts[nameIdx] || '') : (parts[1] || '');
      const classVal = hasHeader ? (parts[classIdx] || '10') : (parts[2] || '10');
      const sectionVal = hasHeader ? (parts[sectionIdx] || 'A') : (parts[3] || 'A');
      const parentName = hasHeader ? (parts[parentNameIdx] || '') : (parts[4] || '');
      let phone = hasHeader ? (parts[phoneIdx] || '') : (parts[5] || '');
      const term1FeeStr = hasHeader ? (parts[term1Idx] || '') : (parts[6] || '');
      const term2FeeStr = hasHeader ? (parts[term2Idx] || '') : (parts[7] || '');
      const routeName = hasHeader ? (parts[routeIdx] || '') : (parts[8] || '');
      const busNumber = hasHeader ? (parts[busIdx] || '') : (parts[9] || '');
      const stopName = hasHeader ? (parts[stopIdx] || '') : (parts[10] || '');

      const rowNum = i + 1;

      // Validate Student Name
      if (!name) {
        errs.push(`Row ${rowNum}: Student Name is required.`);
      }

      // Validate Class (std) & Section
      if (!classVal) {
        errs.push(`Row ${rowNum}: Class (std) is required.`);
      }
      if (!sectionVal) {
        errs.push(`Row ${rowNum}: Section is required.`);
      }

      // Validate Parent Name
      if (!parentName) {
        errs.push(`Row ${rowNum}: Parent/Guardian Name is required.`);
      }

      // Validate Parent Phone (must be exactly 10 digits)
      const digitsOnly = phone.replace(/\D/g, '');
      const corePhone = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
      if (!phone || corePhone.length !== 10) {
        errs.push(`Row ${rowNum}: Parent WhatsApp number '${phone}' is invalid. Must be exactly 10 digits.`);
      }

      // Validate Term 1 & Term 2 Fees
      const term1Fee = term1FeeStr ? parseFloat(term1FeeStr) : 600;
      const term2Fee = term2FeeStr ? parseFloat(term2FeeStr) : 600;

      if (isNaN(term1Fee) || term1Fee < 0) {
        errs.push(`Row ${rowNum}: Term 1 Fee must be a valid positive number.`);
      }
      if (isNaN(term2Fee) || term2Fee < 0) {
        errs.push(`Row ${rowNum}: Term 2 Fee must be a valid positive number.`);
      }

      // Match Route, Bus, and Stop from Database
      let matchedRoute = routes.find(r => 
        r.name.toLowerCase().trim() === routeName.toLowerCase().trim() || 
        r.name.toLowerCase().includes(routeName.toLowerCase())
      );
      
      let matchedStop = stops.find(s => 
        s.stopName.toLowerCase().trim() === stopName.toLowerCase().trim() || 
        s.stopName.toLowerCase().includes(stopName.toLowerCase())
      );

      if (!matchedRoute && matchedStop) {
        matchedRoute = routes.find(r => r.id === matchedStop.routeId);
      }

      if (!matchedRoute && routes.length > 0) {
        matchedRoute = routes[0];
      }

      const routeId = matchedRoute ? matchedRoute.id : '';

      let matchedBus = buses.find(b => 
        b.busNumber.toLowerCase().trim() === busNumber.toLowerCase().trim() || 
        b.busNumber.toLowerCase().includes(busNumber.toLowerCase())
      );

      if (!matchedBus && routeId) {
        matchedBus = buses.find(b => b.routeId === routeId) || buses[0];
      }

      const busId = matchedBus ? matchedBus.id : '';

      if (!matchedStop && routeId) {
        matchedStop = stops.find(s => s.routeId === routeId) || stops[0];
      }

      const stopId = matchedStop ? matchedStop.id : '';

      // Set Student ID (auto-generate if missing)
      let finalStudentId = studentId.trim();
      if (!finalStudentId) {
        finalStudentId = `ST-${classVal}-${2000 + i + 1}`;
      }

      rows.push({
        studentId: finalStudentId,
        admissionNumber: `ADM-2026-${String(rowNum + 100).padStart(3, '0')}`,
        name,
        password: 'password123',
        class: classVal,
        section: sectionVal,
        routeId,
        busId,
        stopId,
        parentName: parentName || `Parent of ${name}`,
        parentPhone: corePhone, // Send raw 10-digit number. Backend formats as +91
        address: stopName || 'Assigned Stop',
        term1Fee: term1Fee,
        term2Fee: term2Fee,
      });
    }

    setParsedRows(rows);
    setValidationErrors(errs);
    setStep('preview');
  };

  const handleValidateAndPreview = () => {
    validateAndPreviewText(rawText);
  };

  const handleExecuteImport = () => {
    const res = bulkImportStudents(parsedRows);
    if (res && res.success) {
      setImportStats({ count: res.count, duplicates: res.duplicates });
      addToast('Import Completed', 'success', `Successfully loaded ${res.count} records. Redirecting to Student Directory...`);
      setStep('result');
      // Navigate to file folder / student directory tab immediately
      setTimeout(() => {
        setAdminTab('students');
      }, 1500);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `StudentID,StudentName,Class,Section,ParentName,ParentPhone,Term1Fee,Term2Fee,RouteName,BusNumber,StopName
ST-8-2001,Rohan Gupta,8,A,Vijay Gupta,9876543210,600,600,North City Express (Route A),BUS-101,Green Meadows Gate 1
ST-9-2002,Tanya Verma,9,B,Sanjay Verma,8877665544,550,550,South Bay Corridor (Route B),BUS-102,Ocean Drive Towers
ST-10-2003,Kabir Rao,10,A,Mohan Rao,7766554433,700,700,East Tech Hub (Route C),BUS-103,Silicon Avenue Gate 4
ST-10-1001,Aarav Sharma,10,A,Ramesh Sharma,9988776655,600,600,West Suburbs (Route D),BUS-104,Oakwood Heights Clubhouse`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'school_bus_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Template Downloaded', 'success', 'Downloaded school_bus_import_template.csv successfully');
  };

  const loadSampleExcelTemplate = () => {
    setRawText(`StudentID,StudentName,Class,Section,ParentName,ParentPhone,Term1Fee,Term2Fee,RouteName,BusNumber,StopName
ST-6-3001, Maya Lin, 6, A, William Lin, 9001122334, 700, 700, North City Express (Route A), BUS-101, Green Meadows Gate 1
ST-7-3002, Ethan Hunt, 7, B, Sarah Hunt, 9002233445, 650, 650, South Bay Corridor (Route B), BUS-102, Ocean Drive Towers
ST-10-3003, Chloe Bennett, 10, C, Arthur Bennett, 9003344556, 600, 600, East Tech Hub (Route C), BUS-103, Silicon Avenue Gate 4
ST-10-1001, Aarav Sharma, 10, A, Ramesh Sharma, 9988776655, 600, 600, West Suburbs (Route D), BUS-104, Oakwood Heights Clubhouse`);
    addToast('Sample Template Loaded', 'info', 'Loaded 4 valid Excel rows with standard format');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
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
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={downloadSampleCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Download real template file"
          >
            <Download className="w-3.5 h-3.5" /> Download Template
          </button>
          <button
            onClick={loadSampleExcelTemplate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Load Sample Data
          </button>
        </div>
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
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".csv, .txt, .xlsx, .xls" 
            className="hidden" 
            onChange={handleFileChange} 
          />
          <div 
            className="border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-8 text-center bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/50 transition-colors cursor-pointer animate-pulse" 
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Click to Browse Local Files or Paste Below</h3>
            <p className="text-xs text-slate-400 mt-1">Supports standard CSV / Excel copy-paste format: StudentID, Name, Class, Section, Phone, Address, TermFee</p>
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
                  <th className="p-3.5">Student ID & Name</th>
                  <th className="p-3.5">Class/Sec</th>
                  <th className="p-3.5">Parent / Contact</th>
                  <th className="p-3.5">Term 1 / 2 Fees</th>
                  <th className="p-3.5">Matched Transit</th>
                  <th className="p-3.5">Status Check</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {parsedRows.map((row, idx) => {
                  const rName = routes.find(r => r.id === row.routeId)?.name || 'Default Route';
                  const bNum = buses.find(b => b.id === row.busId)?.busNumber || 'Default Bus';
                  const sName = stops.find(s => s.id === row.stopId)?.stopName || 'Default Stop';
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{row.name}</div>
                        <div className="font-mono text-[10px] text-slate-400 font-bold">{row.studentId}</div>
                      </td>
                      <td className="p-3.5 font-medium">{row.class} - {row.section}</td>
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-300">{row.parentName}</div>
                        <div className="font-mono text-[10px] text-slate-500 font-bold">+{row.parentPhone}</div>
                      </td>
                      <td className="p-3.5 font-mono">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">Term 1: {settings.currency}{row.term1Fee}</div>
                        <div className="text-[10px] text-slate-500">Term 2: {settings.currency}{row.term2Fee}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[150px]" title={rName}>{rName}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-bold text-slate-600 dark:text-slate-400">{bNum}</span>
                          <span className="text-slate-300">|</span>
                          <span className="truncate max-w-[120px] font-medium" title={sName}>{sName}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                          READY
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
