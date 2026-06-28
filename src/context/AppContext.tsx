import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Student, Bus, Route, Stop, PaymentRecord, SchoolSettings, 
  AuditLog, ToastMessage, Role, AdminActiveTab, StudentActiveTab 
} from '../types';
import { 
  initialStudents, initialBuses, initialRoutes, initialStops, 
  initialPayments, initialSettings, initialAuditLogs 
} from '../data/seedData';

interface AppContextType {
  // Auth state
  currentRole: Role;
  currentUser: Student | { id: 'admin'; name: 'Transport Admin'; email: 'admin@school.edu' } | null;
  splashCompleted: boolean;
  setSplashCompleted: (val: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  login: (identifier: string, pass: string, role: Role) => boolean;
  logout: () => void;
  switchDemoRole: (role: Role) => void;

  // UI state
  darkMode: boolean;
  toggleDarkMode: () => void;
  adminTab: AdminActiveTab;
  setAdminTab: (tab: AdminActiveTab) => void;
  studentTab: StudentActiveTab;
  setStudentTab: (tab: StudentActiveTab) => void;
  toasts: ToastMessage[];
  addToast: (title: string, type?: ToastMessage['type'], description?: string) => void;
  removeToast: (id: string) => void;

  // Data collections
  students: Student[];
  buses: Bus[];
  routes: Route[];
  stops: Stop[];
  payments: PaymentRecord[];
  settings: SchoolSettings;
  auditLogs: AuditLog[];

  // CRUD Students
  addStudent: (student: Omit<Student, 'id' | 'paidAmount' | 'pendingAmount' | 'status'>) => { success: boolean; error?: string };
  updateStudent: (id: string, data: Partial<Student>) => { success: boolean; error?: string };
  deleteStudent: (id: string) => { success: boolean; error?: string };
  bulkImportStudents: (imported: Array<Partial<Student>>) => { success: boolean; count: number; duplicates: number };

  // CRUD Payments
  recordPayment: (studentId: string, amount: number, term: 'term1' | 'term2' | 'both', method: PaymentRecord['method']) => { success: boolean; receipt?: PaymentRecord; error?: string };
  markAsPaidAdmin: (studentId: string, term: 'term1' | 'term2' | 'both', method: PaymentRecord['method'], remarks?: string) => { success: boolean; error?: string };

  // CRUD Buses
  addBus: (bus: Omit<Bus, 'id'>) => { success: boolean; error?: string };
  updateBus: (id: string, data: Partial<Bus>) => void;
  deleteBus: (id: string) => { success: boolean; error?: string };

  // CRUD Routes
  addRoute: (route: Omit<Route, 'id'>) => { success: boolean; error?: string };
  updateRoute: (id: string, data: Partial<Route>) => void;
  deleteRoute: (id: string) => { success: boolean; error?: string };

  // CRUD Stops
  addStop: (stop: Omit<Stop, 'id'>) => void;
  updateStop: (id: string, data: Partial<Stop>) => void;
  deleteStop: (id: string) => void;
  reorderStops: (routeId: string, orderedStopIds: string[]) => void;

  // Settings & Logs
  updateSettings: (newSettings: Partial<SchoolSettings>) => void;
  resetToSeedData: () => void;
  addAuditLog: (action: string, module: string, details: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  STUDENTS: 'sbfms_students_v1',
  BUSES: 'sbfms_buses_v1',
  ROUTES: 'sbfms_routes_v1',
  STOPS: 'sbfms_stops_v1',
  PAYMENTS: 'sbfms_payments_v1',
  SETTINGS: 'sbfms_settings_v1',
  AUDIT: 'sbfms_audit_v1',
  USER: 'sbfms_current_user_v1',
  ROLE: 'sbfms_current_role_v1',
  DARK_MODE: 'sbfms_dark_mode_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial data from localStorage or seed
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [buses, setBuses] = useState<Bus[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUSES);
    return saved ? JSON.parse(saved) : initialBuses;
  });

  const [routes, setRoutes] = useState<Route[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROUTES);
    return saved ? JSON.parse(saved) : initialRoutes;
  });

  const [stops, setStops] = useState<Stop[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOPS);
    return saved ? JSON.parse(saved) : initialStops;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [currentRole, setCurrentRole] = useState<Role>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as Role) || 'admin';
  });

  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) return JSON.parse(saved);
    return { id: 'admin', name: 'Transport Admin', email: 'admin@school.edu' };
  });

  const [splashCompleted, setSplashCompleted] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.DARK_MODE) === 'true';
  });

  const [adminTab, setAdminTab] = useState<AdminActiveTab>('dashboard');
  const [studentTab, setStudentTab] = useState<StudentActiveTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BUSES, JSON.stringify(buses)); }, [buses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes)); }, [routes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STOPS, JSON.stringify(stops)); }, [stops]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ROLE, currentRole); }, [currentRole]);
  useEffect(() => { 
    if (currentUser) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    else localStorage.removeItem(STORAGE_KEYS.USER);
  }, [currentUser]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(darkMode)); }, [darkMode]);

  // Sync with full-stack Express API backend
  useEffect(() => {
    const hydrateFromCloudAPI = async () => {
      try {
        const [stRes, flRes, payRes, setRes] = await Promise.all([
          fetch('/api/students').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/fleet').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/payments').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/settings').then(r => r.ok ? r.json() : null).catch(() => null),
        ]);
        if (stRes?.students) setStudents(stRes.students);
        if (flRes?.buses) setBuses(flRes.buses);
        if (flRes?.routes) setRoutes(flRes.routes);
        if (flRes?.stops) setStops(flRes.stops);
        if (payRes?.payments) setPayments(payRes.payments);
        if (setRes?.settings) setSettings(setRes.settings);
        console.log('✅ Synchronized state from Cloud Express API');
      } catch (err) {
        console.warn('⚠️ Cloud API unreachable, fallback to local storage state');
      }
    };
    hydrateFromCloudAPI();
  }, []);

  // Apply dark mode class to html tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const addToast = (title: string, type: ToastMessage['type'] = 'info', description?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts(prev => [...prev, { id, title, type, description }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: currentUser?.name || 'System Actor',
      role: currentRole,
      action,
      module,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auth Methods
  const login = (identifier: string, pass: string, role: Role): boolean => {
    if (role === 'admin') {
      if (identifier.toLowerCase().includes('admin') || pass === 'admin123') {
        setCurrentRole('admin');
        const adminObj = { id: 'admin', name: 'Transport Admin', email: identifier || 'admin@school.edu' };
        setCurrentUser(adminObj);
        addAuditLog('LOGIN', 'Auth', `Admin logged in via ${identifier}`);
        addToast('Welcome Admin', 'success', 'Logged into Admin Transport Dashboard');
        return true;
      }
      addToast('Authentication Failed', 'error', 'Invalid Admin Credentials (Hint: admin@school.edu / admin123)');
      return false;
    } else {
      // Student login
      const found = students.find(s => s.studentId.toLowerCase() === identifier.toLowerCase() || s.name.toLowerCase() === identifier.toLowerCase());
      if (found) {
        if (!pass || pass === found.password || pass === 'pass123' || pass === 'password123') {
          setCurrentRole('student');
          setCurrentUser(found);
          addAuditLog('LOGIN', 'Auth', `Student ${found.name} (${found.studentId}) logged in`);
          addToast(`Welcome ${found.name}`, 'success', `Route: ${routes.find(r => r.id === found.routeId)?.name || 'Assigned Route'}`);
          return true;
        }
      }
      addToast('Student Not Found', 'error', 'Could not find student with that ID or incorrect password. (Hint demo: STU1001 / pass123)');
      return false;
    }
  };

  const logout = () => {
    const name = currentUser?.name || 'User';
    setCurrentUser(null);
    addToast('Logged Out', 'info', `${name} logged out successfully`);
  };

  const switchDemoRole = (role: Role) => {
    setCurrentRole(role);
    if (role === 'admin') {
      setCurrentUser({ id: 'admin', name: 'Transport Admin', email: 'admin@school.edu' });
      addToast('Switched to Admin View', 'info', 'Full management access activated');
    } else {
      setCurrentUser(students[0] || null);
      addToast('Switched to Student View', 'info', `Viewing as ${students[0]?.name || 'Student'}`);
    }
  };

  // CRUD Students
  const addStudent = (data: Omit<Student, 'id' | 'paidAmount' | 'pendingAmount' | 'status'>) => {
    if (students.some(s => s.studentId.toLowerCase() === data.studentId.toLowerCase())) {
      addToast('Duplicate Student ID', 'error', `Student ID ${data.studentId} already exists!`);
      return { success: false, error: 'Duplicate Student ID' };
    }
    const totalFee = data.term1Fee + data.term2Fee;
    const newStudent: Student = {
      ...data,
      id: 'stu-' + Date.now(),
      paidAmount: 0,
      pendingAmount: totalFee,
      status: totalFee > 0 ? 'pending' : 'paid',
    };
    setStudents(prev => [newStudent, ...prev]);
    fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newStudent) }).catch(() => {});
    addAuditLog('ADD_STUDENT', 'Students', `Added student ${newStudent.name} (${newStudent.studentId})`);
    addToast('Student Added', 'success', `${newStudent.name} enrolled to Class ${newStudent.class}-${newStudent.section}`);
    return { success: true };
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, ...data };
      const totalFee = updated.term1Fee + updated.term2Fee;
      updated.pendingAmount = Math.max(0, totalFee - updated.paidAmount);
      if (updated.paidAmount >= totalFee && totalFee > 0) updated.status = 'paid';
      else if (updated.paidAmount > 0) updated.status = 'partial';
      else updated.status = 'pending';
      return updated;
    }));
    fetch(`/api/students/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).catch(() => {});
    // If updating current logged in student
    if (currentUser?.id === id) {
      setCurrentUser((prev: any) => ({ ...prev, ...data }));
    }
    addAuditLog('EDIT_STUDENT', 'Students', `Updated student record ID: ${id}`);
    addToast('Student Updated', 'success', 'Changes saved successfully');
    return { success: true };
  };

  const deleteStudent = (id: string) => {
    const target = students.find(s => s.id === id);
    if (!target) return { success: false, error: 'Not found' };
    
    // Check payment history edge case
    const hasPayments = payments.some(p => p.studentId === target.studentId);
    if (hasPayments) {
      addToast('Warning: Payment History', 'warning', `Deleted student ${target.name} who had past payment records.`);
    }

    setStudents(prev => prev.filter(s => s.id !== id));
    fetch(`/api/students/${id}`, { method: 'DELETE' }).catch(() => {});
    addAuditLog('DELETE_STUDENT', 'Students', `Deleted student ${target.name} (${target.studentId})`);
    addToast('Student Removed', 'info', `Deleted ${target.name} from directory`);
    return { success: true };
  };

  const bulkImportStudents = (imported: Array<Partial<Student>>) => {
    let count = 0;
    let duplicates = 0;
    const newArr = [...students];

    imported.forEach(item => {
      if (!item.studentId || !item.name) return;
      if (newArr.some(s => s.studentId.toLowerCase() === item.studentId!.toLowerCase())) {
        duplicates++;
        return;
      }
      const t1 = item.term1Fee || settings.term1DueDate ? 600 : 500;
      const t2 = item.term2Fee || 600;
      const st: Student = {
        id: 'stu-bulk-' + Math.random().toString(36).slice(2, 9),
        studentId: item.studentId,
        admissionNumber: item.admissionNumber || `ADM-${Date.now().toString().slice(-4)}`,
        name: item.name,
        password: item.password || 'password123',
        class: item.class || '5',
        section: item.section || 'A',
        routeId: item.routeId || routes[0]?.id || 'r-1',
        busId: item.busId || buses[0]?.id || 'b-1',
        stopId: item.stopId || stops[0]?.id || 's-101',
        parentName: item.parentName || `${item.name.split(' ')[0]} Parent`,
        parentPhone: item.parentPhone || '+1 (555) 000-0000',
        address: item.address || 'School Bus Route Stop',
        term1Fee: t1,
        term2Fee: t2,
        paidAmount: 0,
        pendingAmount: t1 + t2,
        status: 'pending',
      };
      newArr.unshift(st);
      count++;
    });

    setStudents(newArr);
    addAuditLog('BULK_IMPORT', 'Students', `Imported ${count} students. Skipped ${duplicates} duplicates.`);
    addToast('Import Complete', 'success', `Added ${count} students successfully. Skipped ${duplicates} duplicates.`);
    return { success: true, count, duplicates };
  };

  // CRUD Payments
  const recordPayment = (
    studentId: string, 
    amount: number, 
    term: 'term1' | 'term2' | 'both', 
    method: PaymentRecord['method']
  ) => {
    if (amount <= 0) {
      addToast('Invalid Amount', 'error', 'Payment amount must be greater than $0.');
      return { success: false, error: 'Negative or zero amount' };
    }

    const st = students.find(s => s.studentId === studentId || s.id === studentId);
    if (!st) {
      addToast('Student Error', 'error', 'Student record not found.');
      return { success: false, error: 'Student not found' };
    }

    if (st.status === 'paid' && st.pendingAmount <= 0) {
      addToast('Already Paid', 'warning', 'This student has already settled all bus fee dues.');
      return { success: false, error: 'Fee already paid' };
    }

    const receiptNum = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPay: PaymentRecord = {
      id: 'pay-' + Date.now(),
      receiptNumber: receiptNum,
      studentId: st.studentId,
      studentName: st.name,
      classSection: `${st.class} - ${st.section}`,
      amount,
      term,
      paymentDate: new Date().toISOString(),
      method,
      status: 'completed',
      remarks: `Paid via ${method} (${term.toUpperCase()})`,
    };

    setPayments(prev => [newPay, ...prev]);
    fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: st.studentId, amount, term, method }) }).catch(() => {});

    // Update student balances
    const newPaid = st.paidAmount + amount;
    const totalFee = st.term1Fee + st.term2Fee;
    const newPending = Math.max(0, totalFee - newPaid);
    let newStatus: Role | PaymentStatus = 'pending';
    if (newPaid >= totalFee) newStatus = 'paid';
    else if (newPaid > 0) newStatus = 'partial';

    updateStudent(st.id, {
      paidAmount: newPaid,
      pendingAmount: newPending,
      status: newStatus as PaymentStatus,
    });

    addAuditLog('PAYMENT_RECEIVED', 'Finance', `Collected ${settings.currency}${amount} from ${st.name} (${receiptNum})`);
    addToast('Payment Successful!', 'success', `Receipt ${receiptNum} generated for ${settings.currency}${amount}`);
    return { success: true, receipt: newPay };
  };

  const markAsPaidAdmin = (
    studentId: string, 
    term: 'term1' | 'term2' | 'both', 
    method: PaymentRecord['method'], 
    remarks?: string
  ) => {
    const st = students.find(s => s.studentId === studentId || s.id === studentId);
    if (!st) return { success: false, error: 'Student not found' };

    let amtToPay = st.pendingAmount;
    if (term === 'term1') amtToPay = Math.min(st.term1Fee, st.pendingAmount);
    if (term === 'term2') amtToPay = Math.min(st.term2Fee, st.pendingAmount);
    if (amtToPay <= 0) amtToPay = st.pendingAmount || 500;

    const res = recordPayment(st.studentId, amtToPay, term, method);
    if (res.success && res.receipt && remarks) {
      setPayments(prev => prev.map(p => p.id === res.receipt!.id ? { ...p, remarks } : p));
    }
    return res;
  };

  // CRUD Buses
  const addBus = (data: Omit<Bus, 'id'>) => {
    if (buses.some(b => b.busNumber.toLowerCase() === data.busNumber.toLowerCase())) {
      addToast('Duplicate Bus Number', 'error', `Bus ${data.busNumber} already registered.`);
      return { success: false, error: 'Duplicate Bus' };
    }
    const newBus: Bus = { ...data, id: 'b-' + Date.now() };
    setBuses(prev => [...prev, newBus]);
    addAuditLog('ADD_BUS', 'Fleet', `Added bus ${newBus.busNumber} (${newBus.driverName})`);
    addToast('Bus Added', 'success', `Registered ${newBus.busNumber} successfully`);
    return { success: true };
  };

  const updateBus = (id: string, data: Partial<Bus>) => {
    setBuses(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
    addToast('Bus Updated', 'success', 'Fleet details saved');
  };

  const deleteBus = (id: string) => {
    const target = buses.find(b => b.id === id);
    if (!target) return { success: false };

    // Edge case check: Delete Bus with Route
    const assignedStudents = students.filter(s => s.busId === id);
    if (assignedStudents.length > 0) {
      addToast('Cannot Delete Active Bus', 'error', `Bus ${target.busNumber} has ${assignedStudents.length} students assigned! Reassign them first.`);
      return { success: false, error: 'Students assigned to bus' };
    }

    setBuses(prev => prev.filter(b => b.id !== id));
    addAuditLog('DELETE_BUS', 'Fleet', `Deleted bus ${target.busNumber}`);
    addToast('Bus Removed', 'info', `Deleted ${target.busNumber}`);
    return { success: true };
  };

  // CRUD Routes
  const addRoute = (data: Omit<Route, 'id'>) => {
    if (routes.some(r => r.name.toLowerCase() === data.name.toLowerCase())) {
      addToast('Duplicate Route Name', 'error', `Route "${data.name}" already exists.`);
      return { success: false, error: 'Duplicate Route' };
    }
    const newRoute: Route = { ...data, id: 'r-' + Date.now() };
    setRoutes(prev => [...prev, newRoute]);
    addAuditLog('ADD_ROUTE', 'Routes', `Added route ${newRoute.name}`);
    addToast('Route Created', 'success', `${newRoute.name} added to grid`);
    return { success: true };
  };

  const updateRoute = (id: string, data: Partial<Route>) => {
    setRoutes(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    addToast('Route Saved', 'success', 'Route details updated');
  };

  const deleteRoute = (id: string) => {
    const target = routes.find(r => r.id === id);
    if (!target) return { success: false };

    // Edge case: Delete Route with Students
    const stuCount = students.filter(s => s.routeId === id).length;
    if (stuCount > 0) {
      addToast('Cannot Delete Route', 'error', `Route "${target.name}" has ${stuCount} students assigned!`);
      return { success: false, error: 'Route has students' };
    }

    setRoutes(prev => prev.filter(r => r.id !== id));
    setStops(prev => prev.filter(s => s.routeId !== id));
    addAuditLog('DELETE_ROUTE', 'Routes', `Deleted route ${target.name}`);
    addToast('Route Deleted', 'info', `Removed ${target.name}`);
    return { success: true };
  };

  // CRUD Stops
  const addStop = (data: Omit<Stop, 'id'>) => {
    const newStop: Stop = { ...data, id: 's-' + Date.now() };
    setStops(prev => [...prev, newStop]);
    addToast('Stop Added', 'success', `${newStop.stopName} added`);
  };

  const updateStop = (id: string, data: Partial<Stop>) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    addToast('Stop Updated', 'success', 'Stop details saved');
  };

  const deleteStop = (id: string) => {
    setStops(prev => prev.filter(s => s.id !== id));
    addToast('Stop Removed', 'info', 'Stop deleted');
  };

  const reorderStops = (routeId: string, orderedStopIds: string[]) => {
    setStops(prev => prev.map(s => {
      if (s.routeId !== routeId) return s;
      const idx = orderedStopIds.indexOf(s.id);
      return idx !== -1 ? { ...s, order: idx + 1 } : s;
    }));
    addToast('Stops Reordered', 'success', 'New pickup sequence saved');
  };

  // Settings & Reset
  const updateSettings = (newSet: Partial<SchoolSettings>) => {
    setSettings(prev => ({ ...prev, ...newSet }));
    addAuditLog('UPDATE_SETTINGS', 'Settings', 'Updated school configuration settings');
    addToast('Settings Saved', 'success', 'System preferences updated');
  };

  const resetToSeedData = () => {
    setStudents(initialStudents);
    setBuses(initialBuses);
    setRoutes(initialRoutes);
    setStops(initialStops);
    setPayments(initialPayments);
    setSettings(initialSettings);
    setAuditLogs(initialAuditLogs);
    addToast('Demo Reset', 'info', 'Restored original seed database');
  };

  return (
    <AppContext.Provider value={{
      currentRole, currentUser, splashCompleted, setSplashCompleted,
      rememberMe, setRememberMe, login, logout, switchDemoRole,
      darkMode, toggleDarkMode, adminTab, setAdminTab, studentTab, setStudentTab,
      toasts, addToast, removeToast,
      students, buses, routes, stops, payments, settings, auditLogs,
      addStudent, updateStudent, deleteStudent, bulkImportStudents,
      recordPayment, markAsPaidAdmin,
      addBus, updateBus, deleteBus,
      addRoute, updateRoute, deleteRoute,
      addStop, updateStop, deleteStop, reorderStops,
      updateSettings, resetToSeedData, addAuditLog
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
