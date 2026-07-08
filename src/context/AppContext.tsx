import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Student, Bus, Route, Stop, PaymentRecord, SchoolSettings, 
  AuditLog, ToastMessage, Role, AdminActiveTab, StudentActiveTab, PaymentStatus 
} from '../types';

interface AppContextType {
  // Auth state
  currentRole: Role;
  currentUser: Student | { id: 'admin'; name: 'Transport Admin'; email: 'admin@school.edu' } | null;
  splashCompleted: boolean;
  setSplashCompleted: (val: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  login: (identifier: string, pass: string, role: Role) => Promise<boolean>;
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
  addStudent: (student: Omit<Student, 'id' | 'paidAmount' | 'pendingAmount' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<{ success: boolean; error?: string }>;
  deleteStudent: (id: string) => Promise<{ success: boolean; error?: string }>;
  bulkImportStudents: (imported: Array<Partial<Student>>) => Promise<{ success: boolean; count: number; duplicates: number }>;

  // CRUD Payments
  recordPayment: (studentId: string, amount: number, term: 'term1' | 'term2' | 'both', method: PaymentRecord['method']) => Promise<{ success: boolean; receipt?: PaymentRecord; error?: string }>;
  markAsPaidAdmin: (studentId: string, term: 'term1' | 'term2' | 'both', method: PaymentRecord['method'], remarks?: string) => Promise<{ success: boolean; error?: string }>;

  // CRUD Buses
  addBus: (bus: Omit<Bus, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateBus: (id: string, data: Partial<Bus>) => Promise<void>;
  deleteBus: (id: string) => Promise<{ success: boolean; error?: string }>;

  // CRUD Routes
  addRoute: (route: Omit<Route, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateRoute: (id: string, data: Partial<Route>) => Promise<void>;
  deleteRoute: (id: string) => Promise<{ success: boolean; error?: string }>;

  // CRUD Stops
  addStop: (stop: Omit<Stop, 'id'>) => Promise<void>;
  updateStop: (id: string, data: Partial<Stop>) => Promise<void>;
  deleteStop: (id: string) => Promise<void>;
  reorderStops: (routeId: string, orderedStopIds: string[]) => Promise<void>;

  // Settings & Logs
  updateSettings: (newSettings: Partial<SchoolSettings>) => Promise<void>;
  resetToSeedData: () => void;
  addAuditLog: (action: string, module: string, details: string) => void;
  selectedAcademicYear: string;
  setSelectedAcademicYear: (year: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USER: 'sbfms_current_user_v1',
  ROLE: 'sbfms_current_role_v1',
  DARK_MODE: 'sbfms_dark_mode_v1',
};

// Create a custom interceptable Axios client that handles authorization
export const api = axios.create({
  baseURL: 'https://school-bus-fee-management.onrender.com'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sbfms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const normalizeStudent = (st: Student): Student => {
  let phone = st.parentPhone || '';
  if (phone.startsWith('+1 (555)')) {
    phone = phone.replace('+1 (555) ', '+91 9');
  }
  return {
    ...st,
    parentPhone: phone,
    academicYear: st.academicYear || '2026 - 2027'
  };
};

const normalizePayment = (pay: PaymentRecord): PaymentRecord => {
  return {
    ...pay,
    academicYear: pay.academicYear || '2026 - 2027'
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Data state variables
  const [students, setStudents] = useState<Student[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [settings, setSettings] = useState<SchoolSettings>({
    schoolName: 'School Bus Transportation',
    academicYear: '2026 - 2027',
    logoUrl: '',
    currency: '$',
    supportPhone: '9876543210',
    supportEmail: 'support@school.edu',
    term1DueDate: '2026-10-31',
    term2DueDate: '2027-03-31',
    paymentGatewaysEnabled: true
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Auth and UI state variables
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

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(() => {
    return localStorage.getItem('sbfms_selected_academic_year') || '2026 - 2027';
  });

  const [adminTab, setAdminTab] = useState<AdminActiveTab>('dashboard');
  const [studentTab, setStudentTab] = useState<StudentActiveTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Centralized academic year filtering
  const filteredStudents = useMemo(() => {
    return students.filter(s => s.academicYear === selectedAcademicYear);
  }, [students, selectedAcademicYear]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => p.academicYear === selectedAcademicYear);
  }, [payments, selectedAcademicYear]);

  // Sync state helpers to localStorage for UI settings
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ROLE, currentRole); }, [currentRole]);
  useEffect(() => { 
    if (currentUser) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    else localStorage.removeItem(STORAGE_KEYS.USER);
  }, [currentUser]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(darkMode)); }, [darkMode]);
  useEffect(() => { localStorage.setItem('sbfms_selected_academic_year', selectedAcademicYear); }, [selectedAcademicYear]);

  // Centralized fetch function from MongoDB Atlas
  const refreshAllData = async () => {
    try {
      const [stRes, flRes, payRes, setRes, logRes] = await Promise.all([
        api.get('/api/students'),
        api.get('/api/fleet'),
        api.get('/api/payments'),
        api.get('/api/settings'),
        api.get('/api/logs').catch(() => ({ data: { logs: [] } }))
      ]);

      if (stRes.data?.students) {
        setStudents(stRes.data.students.map(normalizeStudent));
      }
      if (flRes.data?.buses) setBuses(flRes.data.buses);
      if (flRes.data?.routes) setRoutes(flRes.data.routes);
      if (flRes.data?.stops) setStops(flRes.data.stops);
      if (payRes.data?.payments) {
        setPayments(payRes.data.payments.map(normalizePayment));
      }
      if (setRes.data?.settings) setSettings(setRes.data.settings);
      if (logRes.data?.logs) setAuditLogs(logRes.data.logs);

      console.log('🔄 Synced fresh state from MongoDB Atlas Atlas');
    } catch (err) {
      console.error('⚠️ Could not connect to Atlas DB', err);
    }
  };

  // Sync with MongoDB API backend on mount
  useEffect(() => {
    refreshAllData();
  }, []);

  // Apply dark mode class to html and body tags
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
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

  const addAuditLog = async (action: string, module: string, details: string) => {
    // Audit logs are stored server side dynamically during MongoDB transactions
  };

  // Real API Login authentication
  const login = async (identifier: string, pass: string, role: Role): Promise<boolean> => {
    try {
      const res = await api.post('/api/auth/login', { email: identifier, password: pass, role });
      const { token, user } = res.data;
      
      localStorage.setItem('sbfms_token', token);
      setCurrentRole(role);
      setCurrentUser(user);
      
      addToast(`Welcome ${user.name}`, 'success', `Successfully authenticated session.`);
      await refreshAllData();
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Authentication Failed';
      addToast('Login Failed', 'error', errMsg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('sbfms_token');
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    setCurrentUser(null);
    addToast('Logged Out', 'info', 'Your session has been securely ended.');
  };

  const switchDemoRole = async (role: Role) => {
    if (role === 'admin') {
      await login('admin@school.edu', 'admin123', 'admin');
    } else {
      // Prioritize an unpaid student so the Razorpay checkout portal/gateway is open for demonstrations
      const defaultStudent = students.find(s => s.pendingAmount > 0) || students[0];
      if (defaultStudent) {
        await login(defaultStudent.studentId, 'password123', 'student');
      } else {
        addToast('No students registered', 'warning', 'Please seed or add a student first.');
      }
    }
  };

  // CRUD Students
  const addStudent = async (data: Omit<Student, 'id' | 'paidAmount' | 'pendingAmount' | 'status'>) => {
    // Validation: extract core 10 digits of phone
    const digits = (data.parentPhone || '').replace(/\D/g, '');
    const coreDigits = digits.length >= 10 ? digits.slice(-10) : digits;
    if (coreDigits.length !== 10) {
      addToast('Validation Error', 'error', 'Parent Phone Number must be exactly 10 digits!');
      return { success: false, error: 'Phone must be exactly 10 digits.' };
    }

    try {
      const payload = {
        ...data,
        parentPhone: `+91 ${coreDigits}`,
        academicYear: data.academicYear || selectedAcademicYear
      };
      await api.post('/api/students', payload);
      addToast('Student Added', 'success', `${data.name} enrolled successfully.`);
      await refreshAllData();
      return { success: true };
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to enroll student';
      addToast('Registration Error', 'error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const updateStudent = async (id: string, data: Partial<Student>) => {
    if (data.parentPhone) {
      const digits = data.parentPhone.replace(/\D/g, '');
      const coreDigits = digits.length >= 10 ? digits.slice(-10) : digits;
      if (coreDigits.length !== 10) {
        addToast('Validation Error', 'error', 'Parent Phone Number must be exactly 10 digits!');
        return { success: false, error: 'Phone must be exactly 10 digits.' };
      }
      data.parentPhone = `+91 ${coreDigits}`;
    }

    try {
      const res = await api.put(`/api/students/${id}`, data);
      addToast('Student Updated', 'success', 'Changes saved successfully to database');
      
      // If updating current logged in student
      if (currentUser?.id === id || currentUser?.studentId === id) {
        setCurrentUser((prev: any) => ({ ...prev, ...res.data.student }));
      }
      await refreshAllData();
      return { success: true };
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to update student';
      addToast('Update Error', 'error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await api.delete(`/api/students/${id}`);
      addToast('Student Removed', 'info', 'Deleted student profile from database.');
      await refreshAllData();
      return { success: true };
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to delete student';
      addToast('Deletion Blocked', 'error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const bulkImportStudents = async (imported: Array<Partial<Student>>) => {
    try {
      const res = await api.post('/api/students/bulk-import', { students: imported });
      addToast('Import Complete', 'success', `Enrolled ${res.data.count} students. skipped duplicate values.`);
      await refreshAllData();
      return { success: true, count: res.data.count, duplicates: imported.length - res.data.count };
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Bulk registration failed';
      addToast('Import Failed', 'error', errMsg);
      return { success: false, count: 0, duplicates: imported.length };
    }
  };

  // CRUD Payments
  const recordPayment = async (
    studentId: string, 
    amount: number, 
    term: 'term1' | 'term2' | 'both', 
    method: PaymentRecord['method']
  ) => {
    if (amount <= 0) {
      addToast('Invalid Amount', 'error', 'Payment amount must be greater than 0.');
      return { success: false, error: 'Negative amount' };
    }

    try {
      const res = await api.post('/api/payments', { studentId, amount, term, method });
      addToast('Payment Successful!', 'success', `Recorded payment receipt of ${settings.currency}${amount}`);
      await refreshAllData();
      return { success: true, receipt: res.data.receipt };
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Collection transaction failed';
      addToast('Payment Error', 'error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const markAsPaidAdmin = async (
    studentId: string, 
    term: 'term1' | 'term2' | 'both', 
    method: PaymentRecord['method'], 
    remarks?: string
  ) => {
    try {
      await api.post('/api/payments/mark-paid', { studentId, term, method, remarks });
      addToast('Administrative Override', 'success', 'Student fee status set to Paid.');
      await refreshAllData();
      return { success: true };
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Override action failed';
      addToast('Action Failed', 'error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // CRUD Buses
  const addBus = async (data: Omit<Bus, 'id'>) => {
    // Phone validation: extract core 10 digits
    const digits = (data.driverPhone || '').replace(/\D/g, '');
    const coreDigits = digits.length >= 10 ? digits.slice(-10) : digits;
    if (coreDigits.length !== 10) {
      addToast('Validation Error', 'error', 'Driver Phone Number must be exactly 10 digits!');
      return { success: false, error: 'Driver phone must be 10 digits' };
    }

    // Reg number
    const regNo = (data.registrationNumber || '').trim();
    if (regNo.length < 5) {
      addToast('Validation Error', 'error', 'Registration Number must be at least 5 characters!');
      return { success: false, error: 'Reg number invalid' };
    }

    // AM only
    if (!(data.startingTime || '').toUpperCase().endsWith('AM')) {
      addToast('Validation Error', 'error', 'Starting Time must be fixed to AM (morning) only!');
      return { success: false, error: 'Starting time must end with AM' };
    }

    try {
      await api.post('/api/fleet/buses', { ...data, driverPhone: `+91 ${coreDigits}`, registrationNumber: regNo });
      addToast('Bus Added', 'success', `Registered bus ${data.busNumber}`);
      await refreshAllData();
      return { success: true };
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to add bus';
      addToast('Error', 'error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const updateBus = async (id: string, data: Partial<Bus>) => {
    if (data.driverPhone) {
      const digits = data.driverPhone.replace(/\D/g, '');
      const coreDigits = digits.length >= 10 ? digits.slice(-10) : digits;
      if (coreDigits.length !== 10) {
        addToast('Validation Error', 'error', 'Driver Phone Number must be exactly 10 digits!');
        return;
      }
      data.driverPhone = `+91 ${coreDigits}`;
    }

    if (data.registrationNumber) {
      const regNo = data.registrationNumber.trim();
      if (regNo.length < 5) {
        addToast('Validation Error', 'error', 'Registration Number must be at least 5 characters!');
        return;
      }
      data.registrationNumber = regNo;
    }

    if (data.startingTime) {
      if (!data.startingTime.toUpperCase().endsWith('AM')) {
        addToast('Validation Error', 'error', 'Starting Time must be fixed to AM (morning) only!');
        return;
      }
    }

    try {
      await api.put(`/api/fleet/buses/${id}`, data);
      addToast('Bus Updated', 'success', 'Fleet updates successfully saved to database.');
      await refreshAllData();
    } catch (err: any) {
      addToast('Update Failed', 'error', err.response?.data?.error || 'Failed to update bus details');
    }
  };

  const deleteBus = async (id: string) => {
    // Verification check: Bus must not have students assigned
    const assignedStudents = students.filter(s => s.busId === id);
    if (assignedStudents.length > 0) {
      addToast('Cannot Delete Bus', 'error', `Bus has ${assignedStudents.length} students assigned! Reassign them first.`);
      return { success: false, error: 'Students assigned to bus' };
    }

    try {
      await api.delete(`/api/fleet/buses/${id}`);
      addToast('Bus Removed', 'info', 'Bus details deleted from directory.');
      await refreshAllData();
      return { success: true };
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to delete bus';
      addToast('Deletion Failed', 'error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // CRUD Routes
  const addRoute = async (data: Omit<Route, 'id'>) => {
    try {
      await api.post('/api/fleet/routes', data);
      addToast('Route Created', 'success', `${data.name} successfully saved to cloud.`);
      await refreshAllData();
      return { success: true };
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to create route';
      addToast('Route Creation Error', 'error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const updateRoute = async (id: string, data: Partial<Route>) => {
    try {
      await api.put(`/api/fleet/routes/${id}`, data);
      addToast('Route Saved', 'success', 'Route details synced to database.');
      await refreshAllData();
    } catch (err: any) {
      addToast('Update Failed', 'error', err.response?.data?.error || 'Failed to save route details');
    }
  };

  const deleteRoute = async (id: string) => {
    // Verification check: Route must not have students assigned
    const assignedStudents = students.filter(s => s.routeId === id);
    if (assignedStudents.length > 0) {
      addToast('Cannot Delete Route', 'error', `Route has ${assignedStudents.length} students assigned! Reassign them first.`);
      return { success: false, error: 'Students assigned to route' };
    }

    try {
      await api.delete(`/api/fleet/routes/${id}`);
      addToast('Route Deleted', 'info', 'Removed route from directory.');
      await refreshAllData();
      return { success: true };
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to delete route';
      addToast('Deletion Failed', 'error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // CRUD Stops
  const addStop = async (data: Omit<Stop, 'id'>) => {
    if (!(data.pickupTime || '').toUpperCase().endsWith('AM')) {
      addToast('Validation Error', 'error', 'Pickup Time must end with AM only!');
      return;
    }
    try {
      await api.post('/api/fleet/stops', data);
      addToast('Stop Registered', 'success', `Stop "${data.stopName}" added.`);
      await refreshAllData();
    } catch (err: any) {
      addToast('Failed', 'error', err.response?.data?.error || 'Could not save stop details');
    }
  };

  const updateStop = async (id: string, data: Partial<Stop>) => {
    if (data.pickupTime) {
      if (!data.pickupTime.toUpperCase().endsWith('AM')) {
        addToast('Validation Error', 'error', 'Pickup Time must end with AM only!');
        return;
      }
    }
    try {
      await api.put(`/api/fleet/stops/${id}`, data);
      addToast('Stop Saved', 'success', 'Transit stop details updated.');
      await refreshAllData();
    } catch (err: any) {
      addToast('Failed', 'error', err.response?.data?.error || 'Could not save stop details');
    }
  };

  const deleteStop = async (id: string) => {
    try {
      await api.delete(`/api/fleet/stops/${id}`);
      addToast('Stop Deleted', 'info', 'Removed stop location.');
      await refreshAllData();
    } catch (err: any) {
      addToast('Failed', 'error', err.response?.data?.error || 'Could not delete stop');
    }
  };

  const reorderStops = async (routeId: string, orderedStopIds: string[]) => {
    try {
      await api.post('/api/fleet/stops/reorder', { routeId, orderedStopIds });
      addToast('Pickup Sequence Saved', 'success', 'Reordered sequence correctly.');
      await refreshAllData();
    } catch (err: any) {
      addToast('Failed', 'error', err.response?.data?.error || 'Could not save sequence');
    }
  };

  // Settings
  const updateSettings = async (newSet: Partial<SchoolSettings>) => {
    try {
      await api.put('/api/settings', newSet);
      addToast('Settings Saved', 'success', 'Portal configurations updated.');
      await refreshAllData();
    } catch (err: any) {
      addToast('Failed', 'error', err.response?.data?.error || 'Could not save settings');
    }
  };

  const resetToSeedData = async () => {
    try {
      await api.post('/api/settings/reset');
      addToast('Reset Complete', 'success', 'System restored successfully to factory seed dataset.');
      await refreshAllData();
    } catch (err: any) {
      addToast('Reset Failed', 'error', err.response?.data?.error || 'Database reset failed.');
    }
  };

  const enrichedCurrentUser = useMemo(() => {
    if (currentUser && currentUser.role === 'student') {
      const fullStudent = students.find(
        s => s.studentId === currentUser.studentId || s.id === currentUser.id
      );
      if (fullStudent) {
        return {
          ...currentUser,
          ...fullStudent
        };
      }
    }
    return currentUser;
  }, [currentUser, students]);

  return (
    <AppContext.Provider value={{
      currentRole, currentUser: enrichedCurrentUser, splashCompleted, setSplashCompleted,
      rememberMe, setRememberMe, login, logout, switchDemoRole,
      darkMode, toggleDarkMode, adminTab, setAdminTab, studentTab, setStudentTab,
      toasts, addToast, removeToast,
      students: filteredStudents, buses, routes, stops, payments: filteredPayments, settings, auditLogs,
      addStudent, updateStudent, deleteStudent, bulkImportStudents,
      recordPayment, markAsPaidAdmin,
      addBus, updateBus, deleteBus,
      addRoute, updateRoute, deleteRoute,
      addStop, updateStop, deleteStop, reorderStops,
      updateSettings, resetToSeedData, addAuditLog,
      selectedAcademicYear, setSelectedAcademicYear
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
