import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ManagerRoute from './components/ManagerRoute';
import EmployeeRoute from './components/EmployeeRoute';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import AdminUsers from './pages/AdminUsers';
import AdminApprovalRules from './pages/AdminApprovalRules';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approval-rules"
            element={
              <ProtectedRoute>
                <AdminApprovalRules />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/dashboard"
            element={
              <ManagerRoute>
                <ManagerDashboard />
              </ManagerRoute>
            }
          />
          <Route
            path="/employee/dashboard"
            element={
              <EmployeeRoute>
                <EmployeeDashboard />
              </EmployeeRoute>
            }
          />
          <Route path="/" element={<Navigate to="/signup" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
