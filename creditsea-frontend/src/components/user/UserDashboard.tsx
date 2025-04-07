import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Money as MoneyIcon,
  Person as PersonIcon,
  Close as CloseIcon,

} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, addMonths } from 'date-fns';
import { loanService, userService } from '../../services/api';
import { LoanApplication, LoanStatus, UserProfile } from '../../types';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';

const statusColors: Record<LoanStatus, string> = {
  [LoanStatus.PENDING]: 'warning',
  [LoanStatus.VERIFIED]: 'info',
  [LoanStatus.APPROVED]: 'success',
  [LoanStatus.REJECTED]: 'error',
  [LoanStatus.DISBURSED]: 'primary',
  [LoanStatus.COMPLETED]: 'secondary'
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [openLoanDialog, setOpenLoanDialog] = useState(false);

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user profile and loan applications
      try {
        const userProfile = await userService.getUserProfile();
        setProfile(userProfile);
      } catch (profileErr) {
        console.error('Error fetching profile:', profileErr);
      }
      
      try {
        const userLoans = await loanService.getUserLoanApplications();
        setLoans(userLoans || []);
      } catch (loansErr) {
        console.error('Error fetching loans:', loansErr);
        setLoans([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  const handleNewLoanClick = () => {
    navigate('/apply');
  };

  const handleViewLoanDetails = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setOpenLoanDialog(true);
  };

  // Calculate statistics
  const totalLoansAmount = loans
    .filter(loan => loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.DISBURSED)
    .reduce((sum, loan) => sum + loan.amount, 0);
    
  const pendingLoansCount = loans.filter(loan => 
    loan.status === LoanStatus.PENDING || loan.status === LoanStatus.VERIFIED
  ).length;
  
  const approvedLoansCount = loans.filter(loan => 
    loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.DISBURSED
  ).length;
  
  const rejectedLoansCount = loans.filter(loan => 
    loan.status === LoanStatus.REJECTED
  ).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header with stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 200,
              backgroundImage: 'linear-gradient(to right, #1e6f42, #2e8f62)',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: 'white',
                  color: '#1e6f42',
                  mr: 2
                }}
              >
                <PersonIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" gutterBottom>
                  Welcome, {profile?.name || 'User'}
                </Typography>
                <Typography variant="body1">
                  Member since: {profile?.createdAt ? format(new Date(profile.createdAt), 'MMM yyyy') : 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" mt={4} justifyContent="space-between">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewLoanClick}
                sx={{ 
                  bgcolor: 'white', 
                  color: '#1e6f42',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  }
                }}
              >
                Apply for New Loan
              </Button>
              <Button
                variant="outlined"
                startIcon={<AssignmentIcon />}
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': {
                    borderColor: '#f5f5f5',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
                onClick={() => navigate('/my-applications')}
              >
                View All Applications
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 200,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: '#1e6f42' }}>
              Your Loan Summary
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <MoneyIcon sx={{ color: '#1e6f42' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Total Approved Amount" 
                  secondary={`$${totalLoansAmount.toLocaleString()}`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AssignmentIcon sx={{ color: '#e67e22' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Applications Status" 
                  secondary={`${pendingLoansCount} Pending · ${approvedLoansCount} Approved · ${rejectedLoansCount} Rejected`} 
                />
              </ListItem>
              
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Application Status */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1e6f42' }}>
          Recent Loan Applications
        </Typography>
        
        {loans.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography variant="body1" color="textSecondary" gutterBottom>
              You haven't applied for any loans yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewLoanClick}
              sx={{ 
                mt: 2, 
                bgcolor: '#1e6f42',
                '&:hover': {
                  bgcolor: '#164f2f',
                }
              }}
            >
              Apply for Your First Loan
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Application ID</TableCell>
                  <TableCell>Purpose</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Application Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.slice(0, 5).map((loan) => (
                  <TableRow key={loan.id || loan._id}>
                    <TableCell>{(loan.id || loan._id)?.substring(0, 8)}</TableCell>
                    <TableCell>{loan.purpose}</TableCell>
                    <TableCell>${loan.amount.toLocaleString()}</TableCell>
                    <TableCell>{format(new Date(loan.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={loan.status.toUpperCase()} 
                        color={statusColors[loan.status] as any} 
                        size="small" 
                        sx={{ fontWeight: 'bold' }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        onClick={() => handleViewLoanDetails(loan)}
                        sx={{ color: '#1e6f42' }}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Available Loan Products */}
      <Typography variant="h6" gutterBottom sx={{ color: '#1e6f42', mt: 4 }}>
        Available Loan Products
      </Typography>
      <Grid container spacing={3}>
        {/* Personal Loan */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" color="#1e6f42" gutterBottom>
                Personal Loan
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Quick access to funds for personal expenses like medical bills, education fees, or home improvements.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Interest Rate:</strong> 12% p.a.
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Max Amount:</strong> $10,000
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Term:</strong> Up to 36 months
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ 
                  mt: 2,
                  color: '#1e6f42',
                  borderColor: '#1e6f42',
                  '&:hover': {
                    borderColor: '#164f2f',
                    bgcolor: 'rgba(30, 111, 66, 0.1)',
                  }
                }}
                onClick={handleNewLoanClick}
              >
                Apply Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
        {/* Business Loan */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" color="#1e6f42" gutterBottom>
                Business Loan
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Grow your business with funds for expansion, inventory, equipment, or working capital needs.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Interest Rate:</strong> 14% p.a.
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Max Amount:</strong> $25,000
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Term:</strong> Up to 48 months
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ 
                  mt: 2,
                  color: '#1e6f42',
                  borderColor: '#1e6f42',
                  '&:hover': {
                    borderColor: '#164f2f',
                    bgcolor: 'rgba(30, 111, 66, 0.1)',
                  }
                }}
                onClick={handleNewLoanClick}
              >
                Apply Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
        {/* Agricultural Loan */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" color="#1e6f42" gutterBottom>
                Agricultural Loan
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Support for farmers to purchase seeds, equipment, livestock, or to improve farming infrastructure.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Interest Rate:</strong> 10% p.a.
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Max Amount:</strong> $15,000
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Term:</strong> Up to 24 months
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ 
                  mt: 2,
                  color: '#1e6f42',
                  borderColor: '#1e6f42',
                  '&:hover': {
                    borderColor: '#164f2f',
                    bgcolor: 'rgba(30, 111, 66, 0.1)',
                  }
                }}
                onClick={handleNewLoanClick}
              >
                Apply Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loan Details Dialog */}
      <Dialog
        open={openLoanDialog}
        onClose={() => setOpenLoanDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Loan Application Details
          <IconButton
            aria-label="close"
            onClick={() => setOpenLoanDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLoan && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" gutterBottom>
                    {selectedLoan.purpose} Loan
                  </Typography>
                  <Chip 
                    label={selectedLoan.status.toUpperCase()} 
                    color={statusColors[selectedLoan.status] as any} 
                    sx={{ fontWeight: 'bold' }} 
                  />
                </Box>
                
                {selectedLoan.status === LoanStatus.REJECTED && selectedLoan.rejectionReason && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2">Rejection Reason:</Typography>
                    <Typography variant="body2">{selectedLoan.rejectionReason}</Typography>
                  </Alert>
                )}
                
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Application ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLoan.id || selectedLoan._id}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Application Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {format(new Date(selectedLoan.createdAt), 'MMMM dd, yyyy')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Loan Amount
                </Typography>
                <Typography variant="body1" gutterBottom>
                  ${selectedLoan.amount.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Loan Term
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLoan.term} months
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Purpose
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLoan.purpose}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Application Status History
                </Typography>
                <Box mt={1}>
                  <TimelineComponent loan={selectedLoan} />
                </Box>
              </Grid>
              
              {selectedLoan.status === LoanStatus.APPROVED && (
                <Grid item xs={12}>
                  <Box border={1} borderColor="divider" borderRadius={1} p={2} mt={2}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: '#1e6f42' }}>
                      Repayment Schedule
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Payment #</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Array.from({ length: Math.min(selectedLoan.term, 3) }, (_, i) => (
                            <TableRow key={i}>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell>
                                {format(
                                  addMonths(
                                    new Date(selectedLoan.approvalDate || selectedLoan.createdAt),
                                    i + 1
                                  ), 
                                  'MMM dd, yyyy'
                                )}
                              </TableCell>
                              <TableCell>
                                ${(selectedLoan.amount / selectedLoan.term).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={i === 0 ? "PENDING" : "UPCOMING"} 
                                  color={i === 0 ? "warning" : "default"} 
                                  size="small" 
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Button 
                      size="small" 
                      sx={{ mt: 1, color: '#1e6f42' }}
                      onClick={() => navigate(`/repayment-schedule/${selectedLoan.id || selectedLoan._id}`)}
                    >
                      View Full Schedule
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLoanDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Helper component for loan status timeline
const TimelineComponent = ({ loan }: { loan: LoanApplication }) => {
  // Returns the date corresponding to the given status.
  const getStatusDate = (status: LoanStatus) => {
    switch(status) {
      case LoanStatus.PENDING:
        return loan.createdAt;
      case LoanStatus.VERIFIED:
        return loan.verificationDate;
      case LoanStatus.APPROVED:
        return loan.approvalDate;
      case LoanStatus.REJECTED:
        return loan.rejectionDate;
      case LoanStatus.DISBURSED:
        return loan.disbursementDate;
      default:
        return null;
    }
  };

  // Define the sequence of statuses to display
  const statuses: LoanStatus[] = [
    LoanStatus.PENDING,
    LoanStatus.VERIFIED,
    LoanStatus.APPROVED,
    LoanStatus.DISBURSED
  ];
  
  // If the loan was rejected, adjust the timeline
  if (loan.status === LoanStatus.REJECTED) {
    const approvedIndex = statuses.indexOf(LoanStatus.APPROVED);
    if (approvedIndex !== -1) {
      statuses.splice(approvedIndex, 1, LoanStatus.REJECTED);
    }
    statuses.pop(); // Remove DISBURSED if loan was rejected
  }
  
  const currentStatusIndex = statuses.indexOf(loan.status);
  
  return (
    <Timeline position="right" sx={{ p: 0, m: 0 }}>
      {statuses.map((status, index) => {
        const statusDate = getStatusDate(status);
        const isCompleted = index <= currentStatusIndex;
        
        return (
          <TimelineItem key={status}>
            <TimelineSeparator>
              <TimelineDot 
                color={
                  isCompleted
                    ? (status === LoanStatus.REJECTED ? 'error' : 'success')
                    : 'grey'
                }
                variant={isCompleted ? 'filled' : 'outlined'}
              />
              {index < statuses.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="body2" fontWeight="bold">
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
              </Typography>
              {statusDate && isCompleted && (
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(statusDate), 'MMM dd, yyyy')}
                </Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

export default UserDashboard;
