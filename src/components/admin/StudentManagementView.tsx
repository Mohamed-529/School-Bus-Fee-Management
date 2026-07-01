import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { 
  Search, Filter, Plus, Edit2, Trash2, Eye, X, Phone, MapPin, 
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, User, Bus 
} from 'lucide-react';

export const StudentManagementView: React.FC = () => {
  const { students, routes, buses, stops, addStudent, updateStudent, deleteStudent, settings, addToast } = useApp();
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterSection, setFilterSection] = useState('ALL');
  const [filterRoute, setFilterRoute] = useState('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    admissionNumber: '',
    name: '',
    password: 'password123',
    class: '10',
    section: 'A',
    routeId: routes[0]?.id || '',
    busId: buses[0]?.id || '',
    stopId: stops[0]?.id || '',
    parentName: '',
    parentPhone: '',
    address: '',
    term1Fee: 600,
    term2Fee: 600,
  });

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        st.name.toLowerCase().includes(q) || 
        st.studentId.toLowerCase().includes(q) || 
        st.parentPhone.includes(q) ||
        routes.find(r => r.id === st.routeId)?.name.toLowerCase().includes(q);
      
      const matchClass = filterClass === 'ALL' || st.class === filterClass;
      const matchSection = filterSection === 'ALL' || st.section === filterSection;
      const matchRoute = filterRoute === 'ALL' || st.routeId === filterRoute;

      return matchSearch && matchClass && matchSection && matchRoute;
    });
  }, [students, searchQuery, filterClass, filterSection, filterRoute, routes]);

  // Pagination slice
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const classOrder = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const uniqueClasses = Array.from(new Set(students.map(s => s.class))).sort((a: any, b: any) => {
    const strA = String(a).toUpperCase();
    const strB = String(b).toUpperCase();
    const idxA = classOrder.indexOf(strA);
    const idxB = classOrder.indexOf(strB);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return strA.localeCompare(strB);
  });
  const uniqueSections = Array.from(new Set(students.map(s => s.section))).sort();

  const CLASSES = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const SECTIONS = ['A', 'B', 'C', 'D'];

  const generateClassWiseId = (className: string) => {
    const classStudents = students.filter(s => s.class === className);
    const countInClass = classStudents.length;
    const cleanClassName = className.replace(/\s+/g, '');
    return `ST-${cleanClassName}-${String(1001 + countInClass)}`;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormError(null);
    setIsSaving(false);
    const initialClass = '10';
    const classWiseId = generateClassWiseId(initialClass);
    const defaultRouteId = routes[0]?.id || '';
    const matchingBuses = buses.filter(b => b.routeId === defaultRouteId);
    const defaultBusId = matchingBuses[0]?.id || routes[0]?.assignedBusId || '';
    const matchingStops = stops.filter(s => s.routeId === defaultRouteId);
    const defaultStopId = matchingStops[0]?.id || '';
    const defaultFee = matchingStops[0]?.feePerStop || 600;

    setFormData({
      studentId: classWiseId,
      admissionNumber: `ADM-2026-${String(students.length + 1).padStart(3, '0')}`,
      name: '',
      password: 'password123',
      class: initialClass,
      section: 'A',
      routeId: defaultRouteId,
      busId: defaultBusId,
      stopId: defaultStopId,
      parentName: '',
      parentPhone: '+91 ',
      address: '',
      term1Fee: defaultFee,
      term2Fee: defaultFee,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st: Student) => {
    setEditingId(st.id);
    setFormError(null);
    setIsSaving(false);
    setFormData({
      studentId: st.studentId,
      admissionNumber: st.admissionNumber,
      name: st.name,
      password: st.password || 'password123',
      class: st.class,
      section: st.section,
      routeId: st.routeId,
      busId: st.busId,
      stopId: st.stopId,
      parentName: st.parentName,
      parentPhone: st.parentPhone.startsWith('+91') ? st.parentPhone : `+91 ${st.parentPhone}`,
      address: st.address,
      term1Fee: st.term1Fee,
      term2Fee: st.term2Fee,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    
    // Explicit Validation checks with Toast warnings
    if (!formData.name.trim()) {
      setFormError('Student Name is required!');
      addToast('Validation Failed', 'error', 'Student Name is required!');
      setIsSaving(false);
      return;
    }
    if (!formData.parentName.trim()) {
      setFormError('Parent/Guardian Name is required!');
      addToast('Validation Failed', 'error', 'Parent/Guardian Name is required!');
      setIsSaving(false);
      return;
    }
    const cleanPhone = formData.parentPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setFormError('Parent WhatsApp number must be exactly 10 digits!');
      addToast('Validation Failed', 'error', 'Parent WhatsApp number must be exactly 10 digits!');
      setIsSaving(false);
      return;
    }
    if (!formData.routeId) {
      setFormError('Please select an active bus route.');
      addToast('Validation Failed', 'error', 'Please select an active bus route.');
      setIsSaving(false);
      return;
    }
    if (!formData.stopId) {
      setFormError('Please allocate a valid transit stop.');
      addToast('Validation Failed', 'error', 'Please allocate a valid transit stop.');
      setIsSaving(false);
      return;
    }

    const payload = {
      ...formData,
      parentPhone: cleanPhone // AppContext will prepend +91
    };

    try {
      if (editingId) {
        const res = await updateStudent(editingId, payload);
        if (res && (res as any).error) {
          setFormError((res as any).error || 'Failed to update student profile');
          setIsSaving(false);
          return; // stay open
        }
      } else {
        const res = await addStudent(payload);
        if (res && !res.success) {
          setFormError((res as any).error || 'Failed to register student record');
          setIsSaving(false);
          return; // stay open
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'An error occurred during submission');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteStudent(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by Name, ID, Phone, Route..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterClass}
              onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Classes</option>
              {uniqueClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>

            <select
              value={filterSection}
              onChange={(e) => { setFilterSection(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Sec</option>
              {uniqueSections.map(s => <option key={s} value={s}>Sec {s}</option>)}
            </select>

            <select
              value={filterRoute}
              onChange={(e) => { setFilterRoute(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[140px] truncate"
            >
              <option value="ALL">All Routes</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Enrol New Student
        </button>
      </div>

      {/* Directory Table Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {paginatedStudents.length === 0 ? (
          <EmptyState 
            title="No Students Matching Filter"
            description="Try clearing your search keyword or resetting the Class & Route filters above."
            action={
              <button 
                onClick={() => { setSearchQuery(''); setFilterClass('ALL'); setFilterSection('ALL'); setFilterRoute('ALL'); }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400"
              >
                Reset All Filters
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Student Identity</th>
                  <th className="px-6 py-4">Class/Sec</th>
                  <th className="px-6 py-4">Assigned Route</th>
                  <th className="px-6 py-4">Parent Details</th>
                  <th className="px-6 py-4">Fee Dues</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {paginatedStudents.map((st) => {
                  const rt = routes.find(r => r.id === st.routeId);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
                            {st.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</div>
                            <div className="font-mono text-[10px] text-slate-400">{st.studentId} • {st.admissionNumber}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {st.class} - {st.section}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">{rt?.name || 'Unassigned'}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Bus className="w-3 h-3 text-indigo-500" /> {buses.find(b => b.id === st.busId)?.busNumber || 'BUS-101'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{st.parentName}</div>
                        <div className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-emerald-500" /> {st.parentPhone}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {settings.currency}{st.pendingAmount}
                        </div>
                        <div className="text-[10px] text-slate-400">Paid: {settings.currency}{st.paidAmount}</div>
                      </td>

                      <td className="px-6 py-4">
                        {st.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> PAID
                          </span>
                        ) : st.status === 'partial' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" /> PARTIAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" /> PENDING
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={() => setDetailStudent(st)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
                          title="View Details Popup"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit Record"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(st.id)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{paginatedStudents.length}</span> of <span className="font-bold">{filteredStudents.length}</span> students
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border bg-white dark:bg-slate-800 disabled:opacity-50 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold px-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border bg-white dark:bg-slate-800 disabled:opacity-50 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-2xl text-indigo-600">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingId ? 'Edit Student Identity & Fee' : 'Enrol New Student Record'}
                </h3>
                <p className="text-xs text-slate-500">Configure route stop allocation & annual transport dues</p>
              </div>
            </div>

             <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-medium">
              {formError && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2 font-bold animate-in shake duration-200">
                  <AlertTriangle className="shrink-0 w-4 h-4 text-red-500 animate-bounce" />
                  <span>{formError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Full Student Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ishaan Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Student ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="STU1015"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Class *</label>
                  <select
                    value={formData.class}
                    onChange={e => {
                      const selectedClass = e.target.value;
                      const nextId = generateClassWiseId(selectedClass);
                      setFormData({ ...formData, class: selectedClass, studentId: nextId });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    {CLASSES.map(cls => <option key={cls} value={cls}>Class {cls}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Section *</label>
                  <select
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    {SECTIONS.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Admission No</label>
                  <input
                    type="text"
                    value={formData.admissionNumber}
                    onChange={e => setFormData({ ...formData, admissionNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Assigned Route *</label>
                  <select
                    value={formData.routeId}
                    onChange={e => {
                      const selectedRouteId = e.target.value;
                      const matchingBuses = buses.filter(b => b.routeId === selectedRouteId);
                      const defaultBusId = matchingBuses[0]?.id || routes.find(r => r.id === selectedRouteId)?.assignedBusId || '';
                      const matchingStops = stops.filter(s => s.routeId === selectedRouteId);
                      const defaultStopId = matchingStops[0]?.id || '';
                      const defaultFee = matchingStops[0]?.feePerStop || 600;
                      setFormData({
                        ...formData,
                        routeId: selectedRouteId,
                        busId: defaultBusId,
                        stopId: defaultStopId,
                        term1Fee: defaultFee,
                        term2Fee: defaultFee
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="">-- Choose Route --</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Assigned Bus Number</label>
                  <select
                    value={formData.busId}
                    onChange={e => setFormData({ ...formData, busId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="">-- No Bus --</option>
                    {buses.filter(b => b.routeId === formData.routeId).map(b => (
                      <option key={b.id} value={b.id}>{b.busNumber} ({b.driverName})</option>
                    ))}
                    {buses.filter(b => b.routeId === formData.routeId).length === 0 && (
                      <option value="" disabled>No Buses on this Route</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Pickup Stop *</label>
                  <select
                    value={formData.stopId}
                    onChange={e => {
                      const stopId = e.target.value;
                      const matchedStop = stops.find(s => s.id === stopId);
                      const fee = matchedStop ? matchedStop.feePerStop : 600;
                      setFormData({
                        ...formData,
                        stopId,
                        term1Fee: fee,
                        term2Fee: fee
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    required
                  >
                    <option value="">-- Choose Stop --</option>
                    {stops.filter(s => s.routeId === formData.routeId).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.stopName} ({settings.currency}{s.feePerStop})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Parent Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Parent / Guardian Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Parent Phone (WhatsApp) *</label>
                  <div className="flex rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden items-center focus-within:ring-2 focus-within:ring-indigo-500">
                    <span className="px-3 text-slate-400 dark:text-slate-500 font-mono text-sm select-none border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">+91</span>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={formData.parentPhone.replace(/\D/g, '')}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, parentPhone: val });
                      }}
                      placeholder="Enter 10 digit number"
                      className="w-full px-3 py-2 bg-transparent border-none text-slate-900 dark:text-white font-mono focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Term 1 Fee ($)</label>
                  <input
                    type="number"
                    value={formData.term1Fee}
                    onChange={e => setFormData({ ...formData, term1Fee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Term 2 Fee ($)</label>
                  <input
                    type="number"
                    value={formData.term2Fee}
                    onChange={e => setFormData({ ...formData, term2Fee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl hover:bg-slate-100 text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Record</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details Popup Modal */}
      {detailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button onClick={() => setDetailStudent(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg">
                {detailStudent.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{detailStudent.name}</h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">{detailStudent.studentId} • Class {detailStudent.class}-{detailStudent.section}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block mb-0.5">Route Assigned</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{routes.find(r => r.id === detailStudent.routeId)?.name || 'Standard Route'}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 block mb-0.5">Bus Number</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{buses.find(b => b.id === detailStudent.busId)?.busNumber || 'BUS-101'}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Parent Name</span>
                  <span className="font-semibold">{detailStudent.parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Parent WhatsApp</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{detailStudent.parentPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup Stop</span>
                  <span className="font-medium">{stops.find(s => s.id === detailStudent.stopId)?.stopName || 'Gate 1'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Residence</span>
                  <span className="font-medium text-right max-w-[200px] truncate">{detailStudent.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-500 block">Pending Amount</span>
                  <span className="text-xl font-mono font-black text-indigo-700 dark:text-indigo-300">{settings.currency}{detailStudent.pendingAmount}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid</span>
                  <span className="text-sm font-mono font-bold text-emerald-600">+{settings.currency}{detailStudent.paidAmount}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end">
              <button
                onClick={() => setDetailStudent(null)}
                className="px-5 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold text-xs"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Delete Student Record?"
        message="This action will permanently remove this student from the active bus roster and delete their associated due notifications. Payment history will be preserved."
        confirmText="Yes, Remove Student"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />

    </div>
  );
};
