import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Link,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  Divider
} from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      
      // Store token in localStorage or a secure cookie
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect based on user role
      if (response.user.role === 'verifier') {
        navigate('/dashboard/verifier');
      } else if (response.user.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (userType: string) => {
    switch (userType) {
      case 'borrower':
        setEmail('borrower@creditsea.com');
        setPassword('Password123');
        break;
      case 'verifier':
        setEmail('verifier@creditsea.com');
        setPassword('Password123');
        break;
      case 'admin':
        setEmail('admin@creditsea.com');
        setPassword('Password123');
        break;
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 8,
          borderRadius: 2
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: '#1e6f42' }}>
          <LockIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          CreditSea Loan Management System
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.2,
              bgcolor: '#1e6f42',
              '&:hover': {
                bgcolor: '#164f2f',
              } 
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
          <Grid container justifyContent="center">
            <Grid item>
              <Link href="/register" variant="body2" sx={{ color: '#1e6f42' }}>
                {"Don't have an account? Register here"}
              </Link>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ width: '100%', my: 3 }} />
        
        <Box sx={{ width: '100%' }}>
          <Typography variant="h6" gutterBottom align="center" sx={{ fontSize: '1rem', fontWeight: 500 }}>
            Demo Credentials
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Button 
                fullWidth 
                variant="outlined" 
                size="small"
                onClick={() => setDemoCredentials('borrower')}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#1e6f42',
                  color: '#1e6f42',
                  '&:hover': {
                    borderColor: '#164f2f',
                    bgcolor: 'rgba(30, 111, 66, 0.1)',
                  }
                }}
              >
                Borrower
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button 
                fullWidth 
                variant="outlined" 
                size="small"
                onClick={() => setDemoCredentials('verifier')}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#1e6f42',
                  color: '#1e6f42',
                  '&:hover': {
                    borderColor: '#164f2f',
                    bgcolor: 'rgba(30, 111, 66, 0.1)',
                  }
                }}
              >
                Verifier
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button 
                fullWidth 
                variant="outlined" 
                size="small"
                onClick={() => setDemoCredentials('admin')}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#1e6f42',
                  color: '#1e6f42',
                  '&:hover': {
                    borderColor: '#164f2f',
                    bgcolor: 'rgba(30, 111, 66, 0.1)',
                  }
                }}
              >
                Admin
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Borrower:</strong> borrower@creditsea.com / Password123
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Verifier:</strong> verifier@creditsea.com / Password123
            </Typography>
            <Typography variant="body2">
              <strong>Admin:</strong> admin@creditsea.com / Password123
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;