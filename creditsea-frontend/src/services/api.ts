import axios from 'axios';
import { 
  User, 
  LoanApplication, 
  AuthResponse, 
  DashboardStats,
  UserProfile,
  UserRole
} from '../types';

// Create axios instance with base URL
// Use import.meta.env for Vite environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization header on each request if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to get proper ID from loan object
const getLoanId = (loan: LoanApplication | string): string => {
  if (typeof loan === 'string') return loan;
  return loan._id || loan.id || '';
};

// Auth Service
export const authService = {
  // Login user
  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log(`Attempting login for user: ${email}`);
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      console.log('Login successful');
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  // Register user
  register: async (userData: any) => {
    console.log(`Registering new user: ${userData.email}`);
    try {
      const response = await api.post('/auth/register', userData);
      console.log('Registration successful');
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },
  
  // Logout user
 // Logout user
logout: async () => {
  console.log('Logging out user');
  try {
    // Option 1: If your backend has a logout endpoint
    // try {
    //   await api.post('/auth/logout');
    // } catch (error) {
    //   console.warn('Logout API call failed, continuing with local logout');
    // }
    
    // Option 2: Client-side logout (more reliable if backend endpoint is missing)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Logout successful');
    
    // Redirect to login page
    window.location.href = '/login';
    
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
},
  
  // Validate token
  validateToken: async () => {
    console.log('Validating auth token');
    try {
      const response = await api.get('/auth/validate-token');
      console.log('Token validation successful');
      return response.data;
    } catch (error) {
      console.error('Token validation failed:', error);
      throw error;
    }
  },
  
  // Request OTP for registration
  requestOTP: async (email: string) => {
    console.log(`Requesting OTP for email: ${email}`);
    try {
      const response = await api.post('/auth/request-otp', { email });
      console.log('OTP request successful');
      return response.data;
    } catch (error) {
      console.error('OTP request failed:', error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async (): Promise<{ user: User }> => {
    console.log('Fetching user profile');
    try {
      const response = await api.get<{ user: User }>('/auth/profile');
      console.log('Profile fetched successfully');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
};

// User Service
export const userService = {
  // Get user profile
  getUserProfile: async (): Promise<UserProfile> => {
    console.log('Fetching user profile');
    try {
      const response = await api.get<UserProfile>('/users/profile');
      console.log('Profile fetched successfully');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
      name: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').name : 'User',
      email: '',
      role: UserRole.BORROWER,
      createdAt: new Date().toISOString()
    };
    }
  },
  
  // Update user profile
  updateUserProfile: async (profileData: any) => {
    console.log('Updating user profile');
    try {
      const response = await api.put('/users/profile', profileData);
      console.log('Profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Get all users (for admin)
  getAllUsers: async (): Promise<{ users: User[] }> => {
    console.log('Fetching all users');
    try {
      const response = await api.get<{ users: User[] }>('/users/all');
      console.log(`Fetched ${response.data.users.length} users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  getAllAdmins: async (): Promise<{ admins: User[] }> => {
    console.log('Fetching all admins');
    try {
      const response = await api.get<{ admins: User[] }>('/users/admins');
      console.log(`Fetched ${response.data.admins.length} admins`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  },
  
  createAdmin: async (name: string, email: string, password: string): Promise<{ admin: User; message: string }> => {
    console.log(`Creating new admin: ${email}`);
    try {
      const response = await api.post<{ admin: User; message: string }>('/users/admin', { name, email, password });
      console.log('Admin created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  },
  
  deleteUser: async (userId: string): Promise<{ message: string }> => {
    console.log(`Deleting user with ID: ${userId}`);
    try {
      const response = await api.delete<{ message: string }>(`/users/${userId}`);
      console.log('User deleted successfully');
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }
};

// Loan Service
export const loanService = {
  // Submit loan application
  submitLoanApplication: async (loanData: any) => {
  // Create a new object with the correct field name structure
  const formattedData = {
    ...loanData,
    loanAmount: loanData.loanAmount // Ensure this field exists
  };
  
  console.log('API sending:', formattedData);
  
  try {
    const response = await api.post('/loans', formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating loan application:', error);
    throw error;
  }
},
  
  // Get user's loan applications
getUserLoanApplications: async (): Promise<LoanApplication[]> => {
  console.log('Fetching user loan applications');
  try {
    const response = await api.get('/loans/user');
    // Handle different response structures
    if (Array.isArray(response.data)) {
      console.log(`Fetched ${response.data.length} user loan applications`);
      return response.data;
    } else if (response.data && response.data.applications) {
      console.log(`Fetched ${response.data.applications.length} user loan applications`);
      return response.data.applications;
    }
    return [];
  } catch (error) {
    console.error('Error fetching user loan applications:', error);
    return [];
  }
},
  // Get all loan applications (for verifier/admin)
  getAllLoanApplications: async (): Promise<{ applications: LoanApplication[] }> => {
    console.log('Fetching all loan applications');
    try {
      const response = await api.get<{ applications: LoanApplication[] }>('/loans');
      console.log(`Fetched ${response.data.applications.length} loan applications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching loan applications:', error);
      throw error;
    }
  },
  
  // Get loan application by ID
  getLoanApplicationById: async (id: string): Promise<{ application: LoanApplication }> => {
    const loanId = getLoanId(id);
    console.log(`Fetching loan application with ID: ${loanId}`);
    try {
      const response = await api.get<{ application: LoanApplication }>(`/loans/${loanId}`);
      console.log('Loan application fetched successfully');
      return response.data;
    } catch (error) {
      console.error(`Error fetching loan application ${loanId}:`, error);
      throw error;
    }
  },
  
  // Verify loan application
  verifyLoanApplication: async (id: string): Promise<{ application: LoanApplication; message: string }> => {
    const loanId = getLoanId(id);
    console.log(`Verifying loan application with ID: ${loanId}`);
    try {
      const response = await api.put<{ application: LoanApplication; message: string }>(`/loans/${loanId}/verify`);
      console.log('Loan application verified successfully');
      return response.data;
    } catch (error) {
      console.error(`Error verifying loan application ${loanId}:`, error);
      throw error;
    }
  },
  
  // Reject loan application
  rejectLoanApplication: async (id: string, rejectionReason: string): Promise<{ application: LoanApplication; message: string }> => {
    const loanId = getLoanId(id);
    console.log(`Rejecting loan application with ID: ${loanId}, Reason: ${rejectionReason}`);
    try {
      const role = JSON.parse(localStorage.getItem('user') || '{}').role;
      const endpoint = role === UserRole.VERIFIER ? `/loans/${loanId}/reject-verifier` : `/loans/${loanId}/reject-admin`;
      
      const response = await api.put<{ application: LoanApplication; message: string }>(
        endpoint, 
        { rejectionReason }
      );
      console.log('Loan application rejected successfully');
      return response.data;
    } catch (error) {
      console.error(`Error rejecting loan application ${loanId}:`, error);
      throw error;
    }
  },
  
  // Approve loan application (for admin)
  approveLoanApplication: async (id: string): Promise<{ application: LoanApplication; message: string }> => {
    const loanId = getLoanId(id);
    console.log(`Approving loan application with ID: ${loanId}`);
    try {
      const response = await api.put<{ application: LoanApplication; message: string }>(`/loans/${loanId}/approve`);
      console.log('Loan application approved successfully');
      return response.data;
    } catch (error) {
      console.error(`Error approving loan application ${loanId}:`, error);
      throw error;
    }
  },
  
  // Get dashboard stats
  getDashboardStats: async () => {
  console.log('Fetching dashboard statistics');
  try {
    const response = await api.get('/loans/dashboard');
    console.log('Dashboard statistics fetched successfully');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    // Return default stats to prevent UI crashes
    return {
      totalLoans: 0,
      totalBorrowers: 0,
      totalAmount: 0,
      totalPending: 0,
      totalVerified: 0,
      totalApproved: 0,
      totalRejected: 0,
      monthlyData: [],
      recentApplications: []
    };
  }
},
  
  // Get loan repayment schedule
  getLoanRepaymentSchedule: async (loanId: string) => {
    const id = getLoanId(loanId);
    console.log(`Fetching repayment schedule for loan ID: ${id}`);
    try {
      const response = await api.get(`/loans/${id}/repayments`);
      console.log('Repayment schedule fetched successfully');
      return response.data;
    } catch (error) {
      console.error(`Error fetching repayment schedule for loan ${id}:`, error);
      throw error;
    }
  },
  
  // Make a loan repayment
  makeLoanRepayment: async (loanId: string, amount: number) => {
    const id = getLoanId(loanId);
    console.log(`Making repayment of ${amount} for loan ID: ${id}`);
    try {
      const response = await api.post(`/loans/${id}/repay`, { amount });
      console.log('Repayment made successfully');
      return response.data;
    } catch (error) {
      console.error(`Error making repayment for loan ${id}:`, error);
      throw error;
    }
  }
};

// Export all services
export default {
  authService,
  userService,
  loanService
};