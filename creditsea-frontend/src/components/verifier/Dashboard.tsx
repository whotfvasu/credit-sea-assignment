import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@mui/material';
import {
  MoneyOff as MoneyOffIcon,
  PeopleAlt as PeopleIcon,
  Receipt as ReceiptIcon,
  Savings as SavingsIcon,
  AccountBalance as BankIcon,
  MonetizationOn as MoneyIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { loanService } from '../../services/api';
import { DashboardStats, LoanStatus, LoanApplication } from '../../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const VerifierDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const { stats } = await loanService.getDashboardStats();
        setStats(stats);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const handleVerifyClick = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setOpenVerifyDialog(true);
  };

  const handleRejectClick = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setOpenRejectDialog(true);
  };

  const handleVerifyConfirm = async () => {
    if (!selectedLoan) return;
    
    try {
      setActionLoading(true);
      await loanService.verifyLoanApplication(selectedLoan.id);
      
      // Refresh data
      const { stats } = await loanService.getDashboardStats();
      setStats(stats);
      
      setOpenVerifyDialog(false);
    } catch (err) {
      console.error('Failed to verify loan:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedLoan || !rejectionReason.trim()) return;
    
    try {
      setActionLoading(true);
      await loanService.rejectLoanApplication(selectedLoan.id, rejectionReason);
      
      // Refresh data
      const { stats } = await loanService.getDashboardStats();
      setStats(stats);
      
      setRejectionReason('');
      setOpenRejectDialog(false);
    } catch (err) {
      console.error('Failed to reject loan:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!stats) return null;

    // Sort monthly data by year and month
    const sortedMonthlyData = [...stats.monthlyData].sort((a, b) => {
      if (a._id.year !== b._id.year) {
        return a._id.year - b._id.year;
      }
      return a._id.month - b._id.month;
    });

    // Create labels (e.g., "Jan 2023")
    const labels = sortedMonthlyData.map(
      (data) => `${monthNames[data._id.month - 1]} ${data._id.year}`
    );

    // Prepare data for line chart (Loans Released Monthly)
    const loansReleasedData = {
      labels,
      datasets: [
        {
          label: 'Loans Released',
          data: sortedMonthlyData.map((data) => data.count),
          borderColor: '#6ab04c',
          backgroundColor: 'rgba(106, 176, 76, 0.5)',
          fill: true,
          tension: 0.4,
        },
      ],
    };

    // Simulate data for bar chart (Outstanding Loans) using the same labels
    const outstanding = sortedMonthlyData.map((data) => 
      Math.round(data.count * 1.5 + Math.random() * 100)
    );

    const outstandingLoansData = {
      labels,
      datasets: [
        {
          label: 'Outstanding Loans',
          data: outstanding,
          backgroundColor: '#3498db',
        },
      ],
    };

    // Simulate data for bar chart (Repayments) using the same labels
    const repayments = sortedMonthlyData.map((data) => 
      Math.round(data.count * 0.8 + Math.random() * 20)
    );

    const repaymentsData = {
      labels,
      datasets: [
        {
          label: 'Repayments Collected',
          data: repayments,
          backgroundColor: '#e74c3c',
        },
      ],
    };

    return {
      loansReleasedData,
      outstandingLoansData,
      repaymentsData,
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
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

  const chartData = prepareChartData();

  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <MoneyOffIcon sx={{ color: '#1e6f42', mr: 1 }} />
              <Typography variant="h6">50</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" align="center">
              LOANS
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <PeopleIcon sx={{ color: '#1e6f42', mr: 1 }} />
              <Typography variant="h6">100</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" align="center">
              BORROWERS
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <MoneyIcon sx={{ color: '#1e6f42', mr: 1 }} />
              <Typography variant="h6">550,000</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" align="center">
              CASH DISBURSED
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <SavingsIcon sx={{ color: '#1e6f42', mr: 1 }} />
              <Typography variant="h6">450,000</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" align="center">
              SAVINGS
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <ReceiptIcon sx={{ color: '#1e6f42', mr: 1 }} />
              <Typography variant="h6">30</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" align="center">
              REPAID LOANS
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <BankIcon sx={{ color: '#1e6f42', mr: 1 }} />
              <Typography variant="h6">1,000,000</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" align="center">
              CASH RECEIVED
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Applied Loans Table */}
      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Applied Loans</Typography>
          <Box>
            <Button variant="outlined" size="small" sx={{ mr: 1 }}>Sort</Button>
            <Button variant="outlined" size="small">Filter</Button>
          </Box>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User Recent Activity</TableCell>
                <TableCell>Customer name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats?.recentApplications?.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2">{loan.purpose}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{loan.applicantName}</TableCell>
                  <TableCell>{format(new Date(loan.createdAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    {loan.status === LoanStatus.PENDING ? (
                      <Box>
                        <Button 
                          variant="contained" 
                          size="small" 
                          color="primary" 
                          sx={{ mr: 1, bgcolor: '#1e6f42' }}
                          onClick={() => handleVerifyClick(loan)}
                        >
                          Verify
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
                    ) : (
                      <StatusChip status={loan.status} />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small">Details</Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!stats?.recentApplications || stats.recentApplications.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2">No recent applications</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Charts */}
      {chartData && (
        <>
          {/* Loans Released Monthly Chart */}
          <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#6ab04c' }}>
              Loans Released Monthly
            </Typography>
            <Box height={300}>
              <Line options={chartOptions} data={chartData.loansReleasedData} />
            </Box>
          </Paper>

          {/* Total Outstanding Open Loans Chart */}
          <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#3498db' }}>
              Total Outstanding Open Loans - Monthly
            </Typography>
            <Box height={300}>
              <Bar options={chartOptions} data={chartData.outstandingLoansData} />
            </Box>
          </Paper>

          {/* Number of Repayments Chart */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#e74c3c' }}>
              Number of Repayments Collected - Monthly
            </Typography>
            <Box height={300}>
              <Bar options={chartOptions} data={chartData.repaymentsData} />
            </Box>
          </Paper>
        </>
      )}

      {/* Verify Dialog */}
      <Dialog
        open={openVerifyDialog}
        onClose={() => setOpenVerifyDialog(false)}
      >
        <DialogTitle>Verify Loan Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to verify this loan application for {selectedLoan?.applicantName}?
            This will mark the application as verified and send it to an admin for final approval.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVerifyDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleVerifyConfirm} 
            color="primary" 
            disabled={actionLoading}
            variant="contained"
            sx={{ bgcolor: '#1e6f42' }}
          >
            {actionLoading ? 'Processing...' : 'Verify'}
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

export default VerifierDashboard;