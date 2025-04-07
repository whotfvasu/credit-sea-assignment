import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Import components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AppNavigation from './components/layout/AppNavigation';
import UserDashboard from './components/user/UserDashboard';
import LoanApplication from './components/loan/LoanApplication.tsx';
import VerifierDashboard from './components/verifier/VerifierDashboard.tsx';
import AdminDashboard from './components/admin/AdminDashboard.tsx';

// Import API services
import { authService } from './services/api';

// Create theme with our primary green color
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e6f42',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// Protected route component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        
        // Verify token validity
        await authService.validateToken();
        
        setAuthenticated(true);
        setUserRole(user?.role || null);
      } catch (error) {
        // Token is invalid, clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Private routes with layout */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppNavigation>
                  {authenticated && userRole === 'verifier' ? (
                    <Navigate to="/dashboard/verifier" replace />
                  ) : authenticated && userRole === 'admin' ? (
                    <Navigate to="/dashboard/admin" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )}
                </AppNavigation>
              </ProtectedRoute>
            } 
          />
          
          {/* User routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <AppNavigation>
                  <UserDashboard />
                </AppNavigation>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/apply" 
            element={
              <ProtectedRoute>
                <AppNavigation>
                  <LoanApplication />
                </AppNavigation>
              </ProtectedRoute>
            } 
          />
          
          {/* Verifier routes */}
          <Route 
            path="/dashboard/verifier" 
            element={
              <ProtectedRoute requiredRole="verifier">
                <AppNavigation>
                  <VerifierDashboard />
                </AppNavigation>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/dashboard/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AppNavigation>
                  <AdminDashboard />
                </AppNavigation>
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;