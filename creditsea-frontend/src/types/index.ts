// src/types/index.ts
export enum UserRole {
  VERIFIER = 'verifier',
  ADMIN = 'admin'
}

export enum LoanStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  APPROVED = 'approved'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoanApplication {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  address: string;
  loanAmount: number;
  purpose: string;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
  verifiedBy?: string;
  approvedBy?: string;
  verificationDate?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface DashboardStats {
  totalPending: number;
  totalVerified: number;
  totalApproved: number;
  totalRejected: number;
  totalApplications: number;
  totalLoanAmount: number;
  recentApplications: LoanApplication[];
  monthlyData: {
    _id: { month: number; year: number };
    count: number;
  }[];
}