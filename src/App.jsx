import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Protection
import AdminLayout from './components/Layouts/AdminLayouts';
import ProtectedRoute from './components/common/ProtectedRoute'; // Ye file jo maine pehle di thi
import { AuthProvider } from './context/AuthContext'; // Ye folder create karke file dalna zaroori hai

// Pages
import Login from './pages/Login';
import Overview from './pages/Overview';
import BusinessProfile from './pages/BusinessProfile';
import Invoices from './pages/Invoices';
import Settings from './pages/Setting';
import Register from './pages/Register';
// 🔥 Naye Pages Import kiye
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Trash from './pages/Trash';

function App() {
  return (
    // 1. AuthProvider poori app ko login state provide karega
    <AuthProvider>
      <Router>
        <Routes>
          {/* =========================================
              🟢 PUBLIC ROUTES (Bina login ke chalenge)
              ========================================= */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* FIX: Ye dono routes Dashboard ke bahar hone chahiye! */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword/>} />
          <Route path="/dashboard/trash" element={<Trash/>} />

          {/* =========================================
              🔴 PROTECTED ROUTES (Sirf login hone par chalenge)
              ========================================= */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Nested Routes - Ye saare AdminLayout ke 'Outlet' mein dikhenge */}
            <Route index element={<Overview />} />
            <Route path="tenants" element={<BusinessProfile />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 Page (Optional but good) */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;