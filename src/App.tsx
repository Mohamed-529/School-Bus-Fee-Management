import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/common/ToastContainer';
import { SplashScreen } from './components/auth/SplashScreen';
import { LoginView } from './components/auth/LoginView';

// Admin views
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { StudentManagementView } from './components/admin/StudentManagementView';
import { BulkImportView } from './components/admin/BulkImportView';
import { PaymentManagementView } from './components/admin/PaymentManagementView';
import { PendingStudentsView } from './components/admin/PendingStudentsView';
import { FleetRoutesView } from './components/admin/FleetRoutesView';
import { ReportsView } from './components/admin/ReportsView';
import { SettingsView } from './components/admin/SettingsView';

// Student views
import { StudentLayout } from './components/student/StudentLayout';
import { StudentDashboardView } from './components/student/StudentDashboardView';
import { StudentPaymentView } from './components/student/StudentPaymentView';
import { StudentProfileView } from './components/student/StudentProfileView';
import { StudentSettingsView } from './components/student/StudentSettingsView';

const MainRouter: React.FC = () => {
  const { splashCompleted, currentUser, currentRole, adminTab, studentTab } = useApp();

  if (!splashCompleted) {
    return <SplashScreen />;
  }

  if (!currentUser) {
    return <LoginView />;
  }

  if (currentRole === 'admin') {
    return (
      <AdminLayout>
        {adminTab === 'dashboard' && <AdminDashboardView />}
        {adminTab === 'students' && <StudentManagementView />}
        {adminTab === 'import' && <BulkImportView />}
        {adminTab === 'payments' && <PaymentManagementView />}
        {adminTab === 'pending' && <PendingStudentsView />}
        {(adminTab === 'buses' || adminTab === 'routes') && <FleetRoutesView />}
        {adminTab === 'reports' && <ReportsView />}
        {adminTab === 'settings' && <SettingsView />}
      </AdminLayout>
    );
  }

  return (
    <StudentLayout>
      {studentTab === 'dashboard' && <StudentDashboardView />}
      {studentTab === 'payment' && <StudentPaymentView />}
      {studentTab === 'profile' && <StudentProfileView />}
      {studentTab === 'settings' && <StudentSettingsView />}
    </StudentLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        <MainRouter />
        <ToastContainer />
      </div>
    </AppProvider>
  );
}
