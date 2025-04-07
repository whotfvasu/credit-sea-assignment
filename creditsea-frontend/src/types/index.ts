// Type definitions for our application

// Loan Status Enum
export enum LoanStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISBURSED = 'disbursed',
  COMPLETED = 'completed'
}

// User Roles Enum
export enum UserRole {
  BORROWER = 'borrower',
  VERIFIER = 'verifier',
  ADMIN = 'admin'
}

// Loan Application Interface
export interface LoanApplication {
  id?: string;
  _id?: string; // MongoDB ID
  applicantId?: string;
  applicantName: string;
  email?: string;
  phone: string;
  address: string;
  idNumber?: string;
  amount: number;
  purpose: string;
  term: number;
  monthlyIncome?: number;
  employmentStatus?: string;
  employer?: string;
  existingLoans?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
  };
  status: LoanStatus;
  rejectionReason?: string;
  verifiedBy?: string;
  verificationDate?: string;
  approvedBy?: string;
  approvalDate?: string;
  rejectedBy?: string;
  rejectionDate?: string;
  disbursementDate?: string;
  createdAt: string;
  updatedAt?: string;
}

// Dashboard Stats Interface
export interface DashboardStats {
  totalLoans: number;
  totalBorrowers: number;
  totalAmount: number;
  totalPending: number;
  totalVerified: number;
  totalApproved: number;
  totalRejected: number;
  totalDisbursed: number;
  monthlyData: {
    _id: {
      month: number;
      year: number;
    };
    count: number;
    amount: number;
  }[];
  recentApplications: LoanApplication[];
}

// User Profile Interface
export interface UserProfile {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: string;
  idNumber?: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

// Loan Repayment Interface
export interface LoanRepayment {
  id?: string;
  _id?: string;
  loanId: string;
  paymentNumber: number;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt?: string;
}

// Loan Product Interface
export interface LoanProduct {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  processingFee?: number;
  requirements?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Notification Interface
export interface Notification {
  id?: string;
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// API Response Interface
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}