import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import { loanService } from '../../services/api';
import { LoanApplication, LoanStatus } from '../../types';

const VerifierLoans = () => {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Loan statistics
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    approved: 0,
    rejected: 0
  });

  const fetchLoans = async () => {
    try {
      setLoading(true);
      console.log("Fetching loan applications...");
      const response = await loanService.getAllLoanApplications();
      console.log("Loan applications response:", response);
      
      if (response && response.applications) {
        setLoans(response.applications);
        
        // Calculate stats
        const pending = response.applications.filter(loan => loan.status === LoanStatus.PENDING).length;
        const verified = response.applications.filter(loan => loan.status === LoanStatus.VERIFIED).length;
        const approved = response.applications.filter(loan => loan.status === LoanStatus.APPROVED).length;
        const rejected = response.applications.filter(loan => loan.status === LoanStatus.REJECTED).length;
        
        setStats({
          pending,
          verified,
          approved,
          rejected
        });
      } else {
        console.error("Invalid response format:", response);
        setError("Failed to load loan applications: Invalid response format");
      }
    } catch (err) {
      console.error('Failed to fetch loan applications:', err);
      setError('Failed to load loan applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleVerifyClick = (loan: LoanApplication) => {
    console.log("Verify button clicked for loan:", loan);
    // Make sure the loan has a proper _id property
    if (!loan._id && loan.id) {
      loan._id = loan.id; // Ensure _id is set if only id exists
    }
    setSelectedLoan(loan);
    setOpenVerifyDialog(true);
  };

  const handleRejectClick = (loan: LoanApplication) => {
    console.log("Reject button clicked for loan:", loan);
    // Make sure the loan has a proper _id property
    if (!loan._id && loan.id) {
      loan._id = loan.id; // Ensure _id is set if only id exists
    }
    setSelectedLoan(loan);
    setOpenRejectDialog(true);
  };

  const handleVerifyConfirm = async () => {
    if (!selectedLoan) {
      console.error("No loan selected for verification");
      setError("No loan selected for verification");
      return;
    }
    
    // Get the loan ID, ensuring we use _id if available, otherwise id
    const loanId = selectedLoan._id || selectedLoan.id;
    
    if (!loanId) {
      console.error("Selected loan has no ID");
      setError("Selected loan has no ID");
      return;
    }
    
    try {
      setActionLoading(true);
      console.log("Verifying loan ID:", loanId);
      
      const response = await loanService.verifyLoanApplication(loanId);
      console.log("Verification response:", response);
      
      if (response && response.application) {
        setSuccessMessage(`Loan application for ${selectedLoan.applicantName} has been verified successfully`);
        
        // Close dialog and refresh loans
        setOpenVerifyDialog(false);
        await fetchLoans();
      } else {
        console.error("Invalid verification response:", response);
        setError("Failed to verify loan: Invalid response format");
      }
    } catch (err: any) {
      console.error('Failed to verify loan:', err);
      setError(err.response?.data?.message || 'Failed to verify loan. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedLoan) {
      console.error("No loan selected for rejection");
      setError("No loan selected for rejection");
      return;
    }
    
    // Get the loan ID, ensuring we use _id if available, otherwise id
    const loanId = selectedLoan._id || selectedLoan.id;
    
    if (!loanId) {
      console.error("Selected loan has no ID");
      setError("Selected loan has no ID");
      return;
    }
    
    if (!rejectionReason.trim()) {
      console.error("Rejection reason is required");
      setError("Please provide a reason for rejection");
      return;
    }
    
    try {
      setActionLoading(true);
      console.log("Rejecting loan ID:", loanId, "Reason:", rejectionReason);
      
      const response = await loanService.rejectLoanApplication(loanId, rejectionReason);
      console.log("Rejection response:", response);
      
      if (response && response.application) {
        setSuccessMessage(`Loan application for ${selectedLoan.applicantName} has been rejected`);
        
        // Reset form, close dialog and refresh loans
        setRejectionReason('');
        setOpenRejectDialog(false);
        await fetchLoans();
      } else {
        console.error("Invalid rejection response:", response);
        setError("Failed to reject loan: Invalid response format");
      }
    } catch (err: any) {
      console.error('Failed to reject loan:', err);
      setError(err.response?.data?.message || 'Failed to reject loan. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSuccessAlert = () => {
    setSuccessMessage(null);
  };

  const handleCloseErrorAlert = () => {
    setError(null);
  };

  // Status chip component
  const StatusChip = ({ status }: { status: LoanStatus }) => {
    switch (status) {
      case LoanStatus.PENDING:
        return <Chip label="PENDING" color="warning" sx={{ fontWeight: 'bold' }} />;
      case LoanStatus.VERIFIED:
        return <Chip label="VERIFIED" color="info" sx={{ fontWeight: 'bold' }} />;
      case LoanStatus.APPROVED:
        return <Chip label="APPROVED" color="success" sx={{ fontWeight: 'bold' }} />;
      case LoanStatus.REJECTED:
        return <Chip label="REJECTED" color="error" sx={{ fontWeight: 'bold' }} />;
      default:
        return <Chip label={status} />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Loan Applications
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: '#FFF9C4' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pending</Typography>
              <Typography variant="h3" sx={{ color: '#F57F17', fontWeight: 'bold' }}>
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: '#E3F2FD' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Verified</Typography>
              <Typography variant="h3" sx={{ color: '#1565C0', fontWeight: 'bold' }}>
                {stats.verified}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: '#E8F5E9' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Approved</Typography>
              <Typography variant="h3" sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                {stats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: '#FFEBEE' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Rejected</Typography>
              <Typography variant="h3" sx={{ color: '#C62828', fontWeight: 'bold' }}>
                {stats.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loan Applications Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Date Applied</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.length > 0 ? (
                loans.map((loan) => (
                  <TableRow key={loan._id || loan.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{loan.applicantName}</Typography>
                        <Typography variant="caption" color="textSecondary">{loan.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>${loan.loanAmount.toLocaleString()}</TableCell>
                    <TableCell>{loan.purpose}</TableCell>
                    <TableCell>
                      {format(new Date(loan.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={loan.status} />
                    </TableCell>
                    <TableCell>
                      {loan.status === LoanStatus.PENDING && (
                        <Box>
                          <Button 
                            variant="contained" 
                            size="small" 
                            color="primary" 
                            sx={{ mr: 1, bgcolor: '#1e6f42' }}
                            onClick={() => handleVerifyClick(loan)}
                          >
                            VERIFY
                          </Button>
                          <Button 
                            variant="contained" 
                            size="small" 
                            color="error"
                            onClick={() => handleRejectClick(loan)}
                          >
                            REJECT
                          </Button>
                        </Box>
                      )}
                      {loan.status !== LoanStatus.PENDING && (
                        <Button variant="outlined" size="small">
                          Details
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" py={3}>
                      No loan applications found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Verify Dialog */}
      <Dialog
        open={openVerifyDialog}
        onClose={() => !actionLoading && setOpenVerifyDialog(false)}
        aria-labelledby="verify-dialog-title"
        aria-describedby="verify-dialog-description"
      >
        <DialogTitle id="verify-dialog-title">Verify Loan Application</DialogTitle>
        <DialogContent>
          <DialogContentText id="verify-dialog-description">
            Are you sure you want to verify this loan application for {selectedLoan?.applicantName}?
            This will mark the application as verified and send it to an admin for final approval.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenVerifyDialog(false)} 
            disabled={actionLoading}
            color="inherit"
          >
            CANCEL
          </Button>
          <Button 
            onClick={handleVerifyConfirm} 
            color="primary" 
            disabled={actionLoading}
            variant="contained"
            autoFocus={false}
            sx={{ bgcolor: '#1e6f42' }}
          >
            {actionLoading ? 'PROCESSING...' : 'VERIFY'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={openRejectDialog}
        onClose={() => !actionLoading && setOpenRejectDialog(false)}
        aria-labelledby="reject-dialog-title"
        aria-describedby="reject-dialog-description"
      >
        <DialogTitle id="reject-dialog-title">Reject Loan Application</DialogTitle>
        <DialogContent>
          <DialogContentText id="reject-dialog-description">
            Please provide a reason for rejecting this loan application:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            type="text"
            fullWidth
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
            error={rejectionReason.trim() === ''}
            helperText={rejectionReason.trim() === '' ? 'Rejection reason is required' : ''}
            variant="outlined"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenRejectDialog(false)} 
            disabled={actionLoading}
            color="inherit"
          >
            CANCEL
          </Button>
          <Button 
            onClick={handleRejectConfirm} 
            color="error" 
            disabled={actionLoading || rejectionReason.trim() === ''}
            variant="contained"
            autoFocus={false}
          >
            {actionLoading ? 'PROCESSING...' : 'REJECT'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Alert */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={handleCloseSuccessAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccessAlert} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Alert */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseErrorAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseErrorAlert} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VerifierLoans;