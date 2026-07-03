import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import ClassesPage from './pages/ClassesPage';
import ClassDetailsPage from './pages/ClassDetailsPage';
import FeesPage from './pages/FeesPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { useAuth } from './AuthContext';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
      <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" replace />} />
      <Route path="/students"  element={user ? <StudentsPage /> : <Navigate to="/login" replace />} />
      <Route path="/classes"   element={user ? <ClassesPage /> : <Navigate to="/login" replace />} />
      <Route path="/classes/:id" element={user ? <ClassDetailsPage /> : <Navigate to="/login" replace />} />
      <Route path="/fees"      element={user ? <FeesPage /> : <Navigate to="/login" replace />} />
      <Route path="/payments"  element={user ? <PaymentsPage /> : <Navigate to="/login" replace />} />
      <Route path="/reports"   element={user ? <ReportsPage /> : <Navigate to="/login" replace />} />
      <Route path="/settings"  element={user ? <SettingsPage /> : <Navigate to="/login" replace />} />
      <Route path="/audit-logs" element={user ? <AuditLogsPage /> : <Navigate to="/login" replace />} />
      <Route path="*"          element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
