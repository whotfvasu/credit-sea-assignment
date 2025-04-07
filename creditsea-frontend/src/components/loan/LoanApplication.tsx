import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  Snackbar,
  InputAdornment,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loanService, userService } from '../../services/api';

// Loan purpose options
const loanPurposes = [
  'Education',
  'Business',
  'Home Improvement',
  'Medical Expenses',
  'Debt Consolidation',
  'Personal',
  'Agriculture',
  'Other'
];

// Employment status options
const employmentStatuses = [
  'Employed',
  'Self-employed',
  'Unemployed',
  'Student',
  'Retired'
];

// Loan term options (in months)
const loanTerms = [
  3, 6, 12, 24, 36
];

const steps = [
  'Personal Information',
  'Loan Details',
  'Financial Information',
  'Review & Submit'
];

const LoanApplication = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    phone: '',
    address: '',
    idNumber: '',
    
    // Loan Details
    loanAmount: '',
    purpose: '',
    term: '',
    
    // Financial Information
    monthlyIncome: '',
    employmentStatus: '',
    employer: '',
    existingLoans: '',
    bankName: '',
    accountNumber: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        const userData = await userService.getUserProfile();
        setUserProfile(userData);
        
        // Pre-fill form with user data if available
        setFormData(prevData => ({
          ...prevData,
          fullName: userData.name || '',
          phone: userData.phone || '',
          address: userData.address || ''
        }));
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Clear error for this field if it exists
      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: ''
        });
      }
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (activeStep === 0) {
      // Validate Personal Information
      if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
    } 
    else if (activeStep === 1) {
      // Validate Loan Details
      if (!formData.loanAmount) newErrors.loanAmount = 'Loan amount is required';
      else if (parseFloat(formData.loanAmount) <= 0) newErrors.loanAmount = 'Amount must be greater than 0';
      
      if (!formData.purpose) newErrors.purpose = 'Please select a purpose';
      if (!formData.term) newErrors.term = 'Please select a loan term';
    } 
    else if (activeStep === 2) {
      // Validate Financial Information
      if (!formData.monthlyIncome) newErrors.monthlyIncome = 'Monthly income is required';
      if (!formData.employmentStatus) newErrors.employmentStatus = 'Employment status is required';
      if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
      if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Format the data with the correct field name
    const loanApplication = {
      applicantName: formData.fullName,
      email: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').email : '',
      phone: formData.phone,
      address: formData.address,
      loanAmount: parseFloat(formData.loanAmount), // Use the correct field name
      purpose: formData.purpose
    };
    
    console.log('Submitting data:', loanApplication);
    
    const response = await loanService.submitLoanApplication(loanApplication);
    console.log('Loan application submitted:', response);
    
    setSuccess(true);
    
    // Reset form after submission
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  } catch (err: any) {
    console.error('Failed to submit loan application:', err);
    setError(err.response?.data?.message || 'Failed to submit loan application. Please try again.');
  } finally {
    setLoading(false);
  }
};

  if (loadingProfile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Render form based on current step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="fullName"
                label="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                fullWidth
                required
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                required
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="idNumber"
                label="National ID / Passport Number"
                value={formData.idNumber}
                onChange={handleChange}
                fullWidth
                required
                error={!!formErrors.idNumber}
                helperText={formErrors.idNumber}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Residential Address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                required
                error={!!formErrors.address}
                helperText={formErrors.address}
              />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="loanAmount"
                label="Loan Amount"
                value={formData.loanAmount}
                onChange={handleChange}
                fullWidth
                required
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                error={!!formErrors.loanAmount}
                helperText={formErrors.loanAmount}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.term}>
                <InputLabel>Loan Term</InputLabel>
                <Select
                  name="term"
                  value={formData.term}
                  label="Loan Term"
                  onChange={handleChange}
                >
                  {loanTerms.map((term) => (
                    <MenuItem key={term} value={term}>{term} months</MenuItem>
                  ))}
                </Select>
                {formErrors.term && <FormHelperText>{formErrors.term}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!formErrors.purpose}>
                <InputLabel>Loan Purpose</InputLabel>
                <Select
                  name="purpose"
                  value={formData.purpose}
                  label="Loan Purpose"
                  onChange={handleChange}
                >
                  {loanPurposes.map((purpose) => (
                    <MenuItem key={purpose} value={purpose}>{purpose}</MenuItem>
                  ))}
                </Select>
                {formErrors.purpose && <FormHelperText>{formErrors.purpose}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="monthlyIncome"
                label="Monthly Income"
                value={formData.monthlyIncome}
                onChange={handleChange}
                fullWidth
                required
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                error={!!formErrors.monthlyIncome}
                helperText={formErrors.monthlyIncome}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.employmentStatus}>
                <InputLabel>Employment Status</InputLabel>
                <Select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  label="Employment Status"
                  onChange={handleChange}
                >
                  {employmentStatuses.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
                {formErrors.employmentStatus && <FormHelperText>{formErrors.employmentStatus}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="employer"
                label="Employer/Business Name"
                value={formData.employer}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="existingLoans"
                label="Existing Loans (if any)"
                value={formData.existingLoans}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                placeholder="Please list any existing loans with amounts"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="bankName"
                label="Bank Name"
                value={formData.bankName}
                onChange={handleChange}
                fullWidth
                required
                error={!!formErrors.bankName}
                helperText={formErrors.bankName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="accountNumber"
                label="Account Number"
                value={formData.accountNumber}
                onChange={handleChange}
                fullWidth
                required
                error={!!formErrors.accountNumber}
                helperText={formErrors.accountNumber}
              />
            </Grid>
          </Grid>
        );
        
      case 3:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review your loan application details before submitting. Once submitted, you cannot edit your application.
            </Alert>
            
            <Typography variant="h6" sx={{ my: 2 }}>Personal Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Full Name</Typography>
                <Typography>{formData.fullName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Phone</Typography>
                <Typography>{formData.phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">ID Number</Typography>
                <Typography>{formData.idNumber}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Address</Typography>
                <Typography>{formData.address}</Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" sx={{ my: 2 }}>Loan Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Loan Amount</Typography>
                <Typography>${formData.loanAmount}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Term</Typography>
                <Typography>{formData.term} months</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Purpose</Typography>
                <Typography>{formData.purpose}</Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" sx={{ my: 2 }}>Financial Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Monthly Income</Typography>
                <Typography>${formData.monthlyIncome}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Employment Status</Typography>
                <Typography>{formData.employmentStatus}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Employer</Typography>
                <Typography>{formData.employer || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Bank Details</Typography>
                <Typography>{formData.bankName}, Account: {formData.accountNumber}</Typography>
              </Grid>
            </Grid>
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          mt: 4,
          mb: 4,
          borderRadius: 2
        }}
      >
        <Typography component="h1" variant="h4" align="center" sx={{ mb: 4, color: '#1e6f42' }}>
          Loan Application
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {renderStepContent()}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            variant="outlined"
          >
            Back
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={{ 
                  bgcolor: '#1e6f42',
                  '&:hover': {
                    bgcolor: '#164f2f',
                  } 
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Application'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ 
                  bgcolor: '#1e6f42',
                  '&:hover': {
                    bgcolor: '#164f2f',
                  } 
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Your loan application has been submitted successfully! You will be redirected to your applications page.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LoanApplication;