import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Container
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { loanService } from '../../services/api';

const validationSchema = Yup.object({
  applicantName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Address is required'),
  loanAmount: Yup.number()
    .min(1000, 'Amount must be at least 1,000')
    .required('Loan amount is required'),
  purpose: Yup.string().required('Loan purpose is required'),
  employmentStatus: Yup.string().required('Employment status is required'),
  employmentAddress: Yup.string().required('Employment address is required'),
  termsAccepted: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
});

const LoanApplicationForm = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      applicantName: '',
      email: '',
      phone: '',
      address: '',
      loanAmount: 5000,
      purpose: '',
      employmentStatus: '',
      employmentAddress: '',
      termsAccepted: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        const loanData = {
          applicantName: values.applicantName,
          email: values.email,
          phone: values.phone,
          address: values.address,
          loanAmount: values.loanAmount,
          purpose: values.purpose,
          employmentStatus: values.employmentStatus,
          employmentAddress: values.employmentAddress
        };
        
        await loanService.createLoanApplication(loanData);
        setSuccess(true);
        formik.resetForm();
      } catch (err: any) {
        console.error('Failed to submit loan application:', err);
        setError(err.response?.data?.message || 'Failed to submit loan application');
      } finally {
        setLoading(false);
      }
    }
  });

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, mx: 'auto' }}>
        <Typography variant="h4" align="center" mb={4}>
          APPLY FOR A LOAN
        </Typography>
        
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="applicantName"
                name="applicantName"
                label="Full name as it appears on bank account"
                value={formik.values.applicantName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.applicantName && Boolean(formik.errors.applicantName)}
                helperText={formik.touched.applicantName && formik.errors.applicantName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="loanAmount"
                name="loanAmount"
                label="How much do you need?"
                type="number"
                value={formik.values.loanAmount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.loanAmount && Boolean(formik.errors.loanAmount)}
                helperText={formik.touched.loanAmount && formik.errors.loanAmount}
                InputProps={{
                  startAdornment: <Box component="span" mr={1}>₹</Box>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email address"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone number"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                name="address"
                label="Address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.employmentStatus && Boolean(formik.errors.employmentStatus)}>
                <InputLabel id="employment-status-label">Employment status</InputLabel>
                <Select
                  labelId="employment-status-label"
                  id="employmentStatus"
                  name="employmentStatus"
                  value={formik.values.employmentStatus}
                  label="Employment status"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="employed">Employed</MenuItem>
                  <MenuItem value="self-employed">Self-employed</MenuItem>
                  <MenuItem value="unemployed">Unemployed</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="retired">Retired</MenuItem>
                </Select>
                {formik.touched.employmentStatus && formik.errors.employmentStatus && (
                  <Typography variant="caption" color="error">
                    {formik.errors.employmentStatus}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="employmentAddress"
                name="employmentAddress"
                label="Employment address"
                value={formik.values.employmentAddress}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.employmentAddress && Boolean(formik.errors.employmentAddress)}
                helperText={formik.touched.employmentAddress && formik.errors.employmentAddress}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="purpose"
                name="purpose"
                label="Reason for loan"
                multiline
                rows={4}
                value={formik.values.purpose}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.purpose && Boolean(formik.errors.purpose)}
                helperText={formik.touched.purpose && formik.errors.purpose}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    id="termsAccepted"
                    name="termsAccepted"
                    checked={formik.values.termsAccepted}
                    onChange={formik.handleChange}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I have read the important information and accept that by completing the 
                    application I will be bound by the terms. Any personal or credit information 
                    obtained may be disclosed from time to time to other lenders, credit bureaus or 
                    other credit reporting agencies.
                  </Typography>
                }
              />
              {formik.touched.termsAccepted && formik.errors.termsAccepted && (
                <Typography variant="caption" color="error">
                  {formik.errors.termsAccepted}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  backgroundColor: '#1e6f42',
                  '&:hover': {
                    backgroundColor: '#186339'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit'}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            Loan application submitted successfully!
          </Alert>
        </Snackbar>

        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default LoanApplicationForm;