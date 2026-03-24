import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminClasses from './pages/admin/AdminClasses';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminReports from './pages/admin/AdminReports';
import ProfessorDashboard from './pages/professor/ProfessorDashboard';
import ProfessorClasses from './pages/professor/ProfessorClasses';
import ProfessorMarkAttendance from './pages/professor/ProfessorMarkAttendance';
import ProfessorLeaves from './pages/professor/ProfessorLeaves';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentSchedule from './pages/student/StudentSchedule';
import StudentLeave from './pages/student/StudentLeave';
import Layout from './components/shared/Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="loading-spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1f35',
              color: '#e8ecf5',
              border: '1px solid rgba(99, 140, 255, 0.2)',
              borderRadius: '12px',
              fontSize: '14px'
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#1a1f35' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#1a1f35' } }
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleRedirect />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminUsers /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/classes" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminClasses /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/leaves" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminLeaves /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminReports /></Layout>
            </ProtectedRoute>
          } />
          
          {/* Professor Routes */}
          <Route path="/professor" element={
            <ProtectedRoute allowedRoles={['professor']}>
              <Layout><ProfessorDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/professor/classes" element={
            <ProtectedRoute allowedRoles={['professor']}>
              <Layout><ProfessorClasses /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/professor/attendance/:classId" element={
            <ProtectedRoute allowedRoles={['professor']}>
              <Layout><ProfessorMarkAttendance /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/professor/leaves" element={
            <ProtectedRoute allowedRoles={['professor']}>
              <Layout><ProfessorLeaves /></Layout>
            </ProtectedRoute>
          } />
          
          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><StudentDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/student/attendance" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><StudentAttendance /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/student/schedule" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><StudentSchedule /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/student/leave" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><StudentLeave /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
