import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();
  
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: '#e74c3c' }}>
            403
          </Typography>
          <Typography variant="h4" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" paragraph>
            You don't have permission to access this page.
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Your current role: {user?.role.toUpperCase() || 'Not authenticated'}
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            sx={{ mt: 2, bgcolor: '#1e6f42' }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized;