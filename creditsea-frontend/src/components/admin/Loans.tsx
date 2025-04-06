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
  CardContent
} from '@mui/material';
import { format } from 'date-fns';
import { loanService } from '../../services/api';
import { LoanApplication, LoanStatus } from '../../types';

const AdminLoans = () => {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await loanService.getAllLoanApplications();
      setLoans(response.applications);
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

  const handleApproveClick = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setOpenApproveDialog(true);
  };

  const handleRejectClick = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setOpenRejectDialog(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedLoan) return;
    
    try {
      setActionLoading(true);
      await loanService.approveLoanApplication(selectedLoan.id);
      
      // Refresh loans
      fetchLoans();
      
      setOpenApproveDialog(false);
    } catch (err) {
      console.error('Failed to approve loan:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedLoan || !rejectionReason.trim()) return;
    
    try {
      setActionLoading(true);
      await loanService.rejectLoanApplication(selectedLoan.id, rejectionReason);
      
      // Refresh loans
      fetchLoans();
      
      setRejectionReason('');
      setOpenRejectDialog(false);
    } catch (err) {
      console.error('Failed to reject loan:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Status chip component
  const StatusChip = ({ status }: { status: LoanStatus }) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    
    switch (status) {
      case LoanStatus.PENDING:
        color = 'warning';
        break;
      case LoanStatus.VERIFIED:
        color = 'info';
        break;
      case LoanStatus.APPROVED:
        color = 'success';
        break;
      case LoanStatus.REJECTED:
        color = 'error';
        break;
    }
    
    return (
      <Chip 
        label={status.toUpperCase()} 
        color={color} 
        size="small" 
        sx={{ fontWeight: 'bold' }} 
      />
    );
  };

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
    <Box>
      <Typography variant="h5" gutterBottom>
        Loan Applications Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#FFF9C4' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pending</Typography>
              <Typography variant="h4" sx={{ color: '#F57F17' }}>
                {loans.filter(loan => loan.status === LoanStatus.PENDING).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#E3F2FD' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Verified</Typography>
              <Typography variant="h4" sx={{ color: '#1565C0' }}>
                {loans.filter(loan => loan.status === LoanStatus.VERIFIED).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#E8F5E9' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Approved</Typography>
              <Typography variant="h4" sx={{ color: '#2E7D32' }}>
                {loans.filter(loan => loan.status === LoanStatus.APPROVED).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#FFEBEE' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Rejected</Typography>
              <Typography variant="h4" sx={{ color: '#C62828' }}>
                {loans.filter(loan => loan.status === LoanStatus.REJECTED).length}
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
                <TableCell>Verified By</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.length > 0 ? (
                loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{loan.applicantName}</Typography>
                        <Typography variant="caption" color="textSecondary">{loan.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>${loan.loanAmount.toLocaleString()}</TableCell>
                    <TableCell>{loan.purpose}</TableCell>
                    <TableCell>{loan.verifiedBy || '-'}</TableCell>
                    <TableCell>
                      <StatusChip status={loan.status} />
                    </TableCell>
                    <TableCell>
                      {loan.status === LoanStatus.VERIFIED && (
                        <Box>
                          <Button 
                            variant="contained" 
                            size="small" 
                            color="primary" 
                            sx={{ mr: 1, bgcolor: '#1e6f42' }}
                            onClick={() => handleApproveClick(loan)}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="contained" 
                            size="small" 
                            color="error"
                            onClick={() => handleRejectClick(loan)}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                      {loan.status !== LoanStatus.VERIFIED && (
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

      {/* Approve Dialog */}
      <Dialog
        open={openApproveDialog}
        onClose={() => setOpenApproveDialog(false)}
      >
        <DialogTitle>Approve Loan Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this loan application for {selectedLoan?.applicantName}?
            This will finalize the loan approval process.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApproveDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleApproveConfirm} 
            color="primary" 
            disabled={actionLoading}
            variant="contained"
            sx={{ bgcolor: '#1e6f42' }}
          >
            {actionLoading ? 'Processing...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
      >
        <DialogTitle>Reject Loan Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for rejecting this verified loan application:
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
          <Button onClick={() => setOpenRejectDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleRejectConfirm} 
            color="error" 
            disabled={actionLoading || rejectionReason.trim() === ''}
            variant="contained"
          >
            {actionLoading ? 'Processing...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminLoans;