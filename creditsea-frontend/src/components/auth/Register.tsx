import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Link,
  Grid,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Avatar
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined as LockIcon,
  CheckCircleOutline as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

// Registration steps
const steps = ['Account Setup', 'Personal Information', 'Verification'];

const Register = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Account Setup
    email: '',
    password: '',
    confirmPassword: '',
    
    // Personal Information
    fullName: '',
    phone: '',
    address: '',
    gender: '',
    idNumber: '',
    
    // Verification
    otp: ''
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (activeStep === 0) {
      // Validate Account Setup
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } 
    else if (activeStep === 1) {
      // Validate Personal Information
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10,12}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      
      if (!formData.address) {
        newErrors.address = 'Address is required';
      }
      
      if (!formData.gender) {
        newErrors.gender = 'Please select your gender';
      }
      
      if (!formData.idNumber) {
        newErrors.idNumber = 'ID number is required';
      }
    }
    else if (activeStep === 2) {
      // Validate Verification
      if (!termsAccepted) {
        newErrors.terms = 'You must accept the terms and conditions';
      }
      
      // Only validate OTP if it's not in demo mode
      if (!formData.otp && !window.location.search.includes('demo')) {
        newErrors.otp = 'Please enter the verification code';
      }
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep(activeStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare registration data
      const registrationData = {
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        idNumber: formData.idNumber,
        verificationCode: formData.otp
      };
      
      // In a real app, you'd send the verification code too
      const response = await authService.register(registrationData);
      console.log('Registration successful:', response);
      
      setRegistrationComplete(true);
      
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle requesting OTP
  const handleRequestOTP = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you'd call an API to send OTP to the user's email or phone
      await authService.requestOTP(formData.email);
      
      // Show success message
      alert('A verification code has been sent to your email. Please check your inbox.');
    } catch (err: any) {
      console.error('Failed to send OTP:', err);
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render form based on current step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" required error={!!formErrors.password}>
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                />
                {formErrors.password && <FormHelperText>{formErrors.password}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" required error={!!formErrors.confirmPassword}>
                <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
                <OutlinedInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Confirm Password"
                />
                {formErrors.confirmPassword && <FormHelperText>{formErrors.confirmPassword}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={2}>
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
            <Grid item xs={12}>
              <FormControl component="fieldset" error={!!formErrors.gender} required>
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  row
                >
                  <FormControlLabel value="female" control={<Radio />} label="Female" />
                  <FormControlLabel value="male" control={<Radio />} label="Male" />
                  <FormControlLabel value="other" control={<Radio />} label="Other" />
                </RadioGroup>
                {formErrors.gender && <FormHelperText>{formErrors.gender}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                We need to verify your identity. A verification code has been sent to your email address.
              </Alert>
              <Box display="flex" alignItems="flex-start">
                <TextField
                  name="otp"
                  label="Verification Code"
                  value={formData.otp}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!formErrors.otp}
                  helperText={formErrors.otp || "Enter the 6-digit code sent to your email"}
                  sx={{ mr: 2 }}
                />
                <Button 
                  variant="outlined" 
                  onClick={handleRequestOTP}
                  sx={{ 
                    mt: 1, 
                    color: '#1e6f42',
                    borderColor: '#1e6f42',
                    '&:hover': {
                      borderColor: '#164f2f',
                      bgcolor: 'rgba(30, 111, 66, 0.1)',
                    }
                  }}
                  disabled={loading}
                >
                  Resend
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <FormControl required error={!!formErrors.terms}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={termsAccepted} 
                      onChange={(e) => setTermsAccepted(e.target.checked)} 
                      name="termsAccepted" 
                    />
                  }
                  label="I agree to the terms and conditions and privacy policy"
                />
                {formErrors.terms && <FormHelperText>{formErrors.terms}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        );
        
      default:
        return null;
    }
  };

  // If registration is complete, show success message
  if (registrationComplete) {
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
          <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography component="h1" variant="h5" gutterBottom align="center">
            Registration Successful!
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Your account has been created successfully. You will be redirected to the login page.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/login')}
            sx={{ 
              bgcolor: '#1e6f42',
              '&:hover': {
                bgcolor: '#164f2f',
              } 
            }}
          >
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
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
          Create an Account
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ width: '100%', mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ width: '100%', mb: 2 }}>
          {renderStepContent()}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 3 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            variant="outlined"
            sx={{ 
              color: '#1e6f42',
              borderColor: '#1e6f42',
              '&:hover': {
                borderColor: '#164f2f',
                bgcolor: 'rgba(30, 111, 66, 0.1)',
              }
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            sx={{ 
              bgcolor: '#1e6f42',
              '&:hover': {
                bgcolor: '#164f2f',
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              'Complete Registration'
            ) : (
              'Next'
            )}
          </Button>
        </Box>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Link href="/login" variant="body2" sx={{ color: '#1e6f42' }}>
            Already have an account? Sign in
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;