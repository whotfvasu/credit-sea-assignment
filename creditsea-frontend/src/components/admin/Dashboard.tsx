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
  Chip
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  PersonAdd as PersonAddIcon,
  AttachMoney as MoneyIcon,
  AccountBalance as BankIcon,
  Savings as SavingsIcon,
  Receipt as ReceiptIcon
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
import { DashboardStats, LoanStatus } from '../../types';

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

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
              <PeopleIcon sx={{ color: '#1e6f42', mr: 1 }} />
              <Typography variant="h6">200</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" align="center">
              ACTIVE USERS
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <PersonAddIcon sx={{ color: '#1e6f42', mr: 1 }} />
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
              <BankIcon sx={{ color: '#1e6f42', mr: 1 }} />
              <Typography variant="h6">1,000,000</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" align="center">
              CASH RECEIVED
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
              <Typography variant="h6">50</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" align="center">
              LOANS
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Loans Table */}
      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Recent Loans</Typography>
          <Button variant="outlined" size="small">View All</Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User details</TableCell>
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
                    <StatusChip status={loan.status} />
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

          {/* Recovery Statistics */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%', bgcolor: '#f39c12', color: 'white' }}>
                <Typography variant="h6" gutterBottom>
                  Rate of Recovery (Open, Fully Paid, Default Loans)
                </Typography>
                <Typography variant="caption">
                  Percentage of the total amount that is paid for all loans
                </Typography>
                <Box display="flex" alignItems="center" mt={2}>
                  <Typography variant="h4" fontWeight="bold" mr={2}>
                    45%
                  </Typography>
                  <Box>
                    <Box width={20} height={40} bgcolor="rgba(255,255,255,0.3)" mr={1} display="inline-block" />
                    <Box width={20} height={60} bgcolor="rgba(255,255,255,0.5)" mr={1} display="inline-block" />
                    <Box width={20} height={80} bgcolor="rgba(255,255,255,0.7)" display="inline-block" />
                  </Box>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%', bgcolor: '#2ecc71', color: 'white' }}>
                <Typography variant="h6" gutterBottom>
                  Rate of Recovery (Open Loans)
                </Typography>
                <Typography variant="caption">
                  Percentage of the due amount that is paid for open loans till today
                </Typography>
                <Box display="flex" alignItems="center" mt={2}>
                  <Typography variant="h4" fontWeight="bold" mr={2}>
                    35%
                  </Typography>
                  <Box>
                    <Box width={20} height={30} bgcolor="rgba(255,255,255,0.3)" mr={1} display="inline-block" />
                    <Box width={20} height={50} bgcolor="rgba(255,255,255,0.5)" mr={1} display="inline-block" />
                    <Box width={20} height={70} bgcolor="rgba(255,255,255,0.7)" display="inline-block" />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

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
    </Box>
  );
};

export default AdminDashboard;