import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserRole } from './types';

// Common components
import Login from './components/auth/Login';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/common/AppLayout';
import NotFound from './components/common/NotFound';
import Unauthorized from './components/common/Unauthorized';

// Admin components
import AdminDashboard from './components/admin/Dashboard';
import AdminLoans from './components/admin/Loans';
import AdminManagement from './components/admin/AdminManagement';

// Verifier components
import VerifierDashboard from './components/verifier/Dashboard';
import VerifierLoans from './components/verifier/Loans';

// Loan components
import LoanApplicationForm from './components/loans/LoanApplicationForm';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e6f42',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          width: '100%',
          margin: '8px 0',
        },
      },
    },
  },
});

// Component to redirect based on auth status and user role
const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === UserRole.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === UserRole.VERIFIER) {
    return <Navigate to="/verifier/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/apply" element={<LoanApplicationForm />} />
            
            {/* Redirect root to proper dashboard based on role or to login if not authenticated */}
            <Route path="/" element={<RootRedirect />} />

            {/* Unauthorized access */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
              <Route element={<AppLayout title="Admin Dashboard" />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/loans" element={<AdminLoans />} />
                <Route path="/admin/manage" element={<AdminManagement />} />
                <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>
            </Route>

            {/* Verifier routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.VERIFIER]} />}>
              <Route element={<AppLayout title="Verifier Dashboard" />}>
                <Route path="/verifier/dashboard" element={<VerifierDashboard />} />
                <Route path="/verifier/loans" element={<VerifierLoans />} />
                <Route path="/verifier/*" element={<Navigate to="/verifier/dashboard" replace />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;