import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  CssBaseline
} from '@mui/material';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface LoginValues {
  email: string;
  password: string;
}

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required')
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const initialValues: LoginValues = {
    email: '',
    password: ''
  };

  const handleSubmit = async (
    values: LoginValues,
    { setSubmitting }: FormikHelpers<LoginValues>
  ) => {
    try {
      setError(null);
      await login(values.email, values.password);
      
      // Get user role from localStorage after successful login
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        // Redirect based on role
        if (user.role === UserRole.ADMIN) {
          navigate('/admin/dashboard');
        } else {
          navigate('/verifier/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: '#ffffff',
          margin: 0,
          padding: 0
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4,
            maxWidth: '400px',
            width: '90%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography component="h1" variant="h3" align="center" gutterBottom sx={{ fontWeight: 500, mb: 1 }}>
            CreditSea
          </Typography>

          <Typography component="h2" variant="h5" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
            Loan Management System
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          <Formik
            initialValues={initialValues}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form style={{ width: '100%' }}>
                <Box sx={{ mb: 2, width: '100%' }}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    variant="outlined"
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                  />
                </Box>
                
                <Box sx={{ mb: 3, width: '100%' }}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    variant="outlined"
                    error={touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                  />
                </Box>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  sx={{ 
                    py: 1.5, 
                    backgroundColor: '#1e6f42',
                    '&:hover': {
                      backgroundColor: '#164a2d'
                    },
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
                
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Demo credentials:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Admin: admin@creditsea.com / Password123
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Verifier: verifier@creditsea.com / Password123
                  </Typography>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </>
  );
};

export default Login;