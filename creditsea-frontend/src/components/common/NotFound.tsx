import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
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
          <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: '#1e6f42' }}>
            404
          </Typography>
          <Typography variant="h4" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" paragraph>
            The page you are looking for does not exist or has been moved.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            sx={{ mt: 2, bgcolor: '#1e6f42' }}
          >
            Go to Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;