export type Role = 'admin' | 'student';

export type PaymentStatus = 'paid' | 'pending' | 'partial';

export interface Student {
  id: string;
  studentId: string; // e.g. STU1001
  admissionNumber: string;
  name: string;
  password?: string;
  class: string;
  section: string;
  routeId: string;
  busId: string;
  stopId: string;
  parentName: string;
  parentPhone: string;
  address: string;
  term1Fee: number;
  term2Fee: number;
  paidAmount: number;
  pendingAmount: number;
  status: PaymentStatus;
  avatar?: string;
}

export interface Bus {
  id: string;
  busNumber: string;
  registrationNumber: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
  routeId: string;
  status: 'active' | 'maintenance';
}

export interface Route {
  id: string;
  name: string; // e.g., North City Route
  description: string;
  assignedBusId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
}

export interface Stop {
  id: string;
  routeId: string;
  stopName: string;
  pickupTime: string; // e.g., "07:30 AM"
  dropTime?: string;
  feePerStop: number;
  order: number;
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  classSection: string;
  amount: number;
  term: 'term1' | 'term2' | 'both';
  paymentDate: string; // ISO string
  method: 'Online Card' | 'UPI' | 'Net Banking' | 'Cash' | 'Cheque';
  status: 'completed' | 'failed' | 'refunded';
  remarks?: string;
}

export interface SchoolSettings {
  schoolName: string;
  academicYear: string;
  logoUrl: string;
  currency: string;
  supportPhone: string;
  supportEmail: string;
  term1DueDate: string;
  term2DueDate: string;
  paymentGatewaysEnabled: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  module: string;
  details: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export type AdminActiveTab = 
  | 'dashboard' 
  | 'students' 
  | 'import' 
  | 'payments' 
  | 'pending' 
  | 'buses' 
  | 'routes' 
  | 'stops' 
  | 'reports' 
  | 'settings';

export type StudentActiveTab = 
  | 'dashboard' 
  | 'payment' 
  | 'profile' 
  | 'settings';
