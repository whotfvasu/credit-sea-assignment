import axios from 'axios';
import { 
  User, 
  LoanApplication, 
  AuthResponse, 
  DashboardStats,
  UserRole
} from '../types';

// Create axios instance with base URL
// Use import.meta.env for Vite environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

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

// Auth services
export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string, role: UserRole): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password, role });
    return response.data;
  },
  
  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/profile');
    return response.data;
  }
};

// User management services
export const userService = {
  getAllUsers: async (): Promise<{ users: User[] }> => {
    const response = await api.get<{ users: User[] }>('/users/all');
    return response.data;
  },
  
  getAllAdmins: async (): Promise<{ admins: User[] }> => {
    const response = await api.get<{ admins: User[] }>('/users/admins');
    return response.data;
  },
  
  createAdmin: async (name: string, email: string, password: string): Promise<{ admin: User; message: string }> => {
    const response = await api.post<{ admin: User; message: string }>('/users/admin', { name, email, password });
    return response.data;
  },
  
  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/users/${userId}`);
    return response.data;
  }
};

// Loan application services
export const loanService = {
  createLoanApplication: async (applicationData: Partial<LoanApplication>): Promise<{ application: LoanApplication; message: string }> => {
    const response = await api.post<{ application: LoanApplication; message: string }>('/loans', applicationData);
    return response.data;
  },
  
  getAllLoanApplications: async (): Promise<{ applications: LoanApplication[] }> => {
    const response = await api.get<{ applications: LoanApplication[] }>('/loans');
    return response.data;
  },
  
  getLoanApplicationById: async (id: string): Promise<{ application: LoanApplication }> => {
    const response = await api.get<{ application: LoanApplication }>(`/loans/${id}`);
    return response.data;
  },
  
  verifyLoanApplication: async (id: string): Promise<{ application: LoanApplication; message: string }> => {
    const response = await api.put<{ application: LoanApplication; message: string }>(`/loans/${id}/verify`);
    return response.data;
  },
  
  rejectLoanApplication: async (id: string, rejectionReason: string): Promise<{ application: LoanApplication; message: string }> => {
    const role = JSON.parse(localStorage.getItem('user') || '{}').role;
    const endpoint = role === UserRole.VERIFIER ? `/loans/${id}/reject-verifier` : `/loans/${id}/reject-admin`;
    
    const response = await api.put<{ application: LoanApplication; message: string }>(endpoint, { rejectionReason });
    return response.data;
  },
  
  approveLoanApplication: async (id: string): Promise<{ application: LoanApplication; message: string }> => {
    const response = await api.put<{ application: LoanApplication; message: string }>(`/loans/${id}/approve`);
    return response.data;
  },
  
  getDashboardStats: async (): Promise<{ stats: DashboardStats }> => {
    const response = await api.get<{ stats: DashboardStats }>('/loans/dashboard');
    return response.data;
  }
};

export default api;