import dotenv from 'dotenv';
import connectDB from '../config/database';
import User, { UserRole } from '../models/User';
import LoanApplication, { LoanStatus } from '../models/LoanApplication';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Sample data
const adminUser = {
  name: 'Admin User',
  email: 'admin@creditsea.com',
  password: 'Password123',
  role: UserRole.ADMIN
};

const verifierUser = {
  name: 'Verifier User',
  email: 'verifier@creditsea.com',
  password: 'Password123',
  role: UserRole.VERIFIER
};

// Add a borrower user
const borrowerUser = {
  name: 'Borrower User',
  email: 'borrower@creditsea.com',
  password: 'Password123',
  role: UserRole.BORROWER,
  phone: '9876543210',
  address: '123 Main St, City',
  createdAt: new Date('2024-01-15')
};

const sampleLoans = [
  {
    applicantName: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    address: '123 Main St, City',
    loanAmount: 50000,
    purpose: 'Home Renovation',
    status: LoanStatus.PENDING
  },
  {
    applicantName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '8765432109',
    address: '456 Oak Ave, Town',
    loanAmount: 100000,
    purpose: 'Education',
    status: LoanStatus.PENDING
  },
  {
    applicantName: 'Robert Johnson',
    email: 'robert@example.com',
    phone: '7654321098',
    address: '789 Pine Rd, Village',
    loanAmount: 75000,
    purpose: 'Business Expansion',
    status: LoanStatus.PENDING
  }
];

const borrowerLoans = [
  {
    applicantName: 'Borrower User',
    email: 'borrower@creditsea.com',
    phone: '9876543210',
    address: '123 Main St, City',
    loanAmount: 25000,  // Changed from 'amount' to 'loanAmount'
    purpose: 'Personal Expenses',
    term: 12,
    monthlyIncome: 50000,
    employmentStatus: 'Employed',
    employer: 'ABC Company',
    bankDetails: {
      bankName: 'National Bank',
      accountNumber: '1234567890'
    },
    status: LoanStatus.PENDING,
    createdAt: new Date('2024-03-01')
  },
  {
    applicantName: 'Borrower User',
    email: 'borrower@creditsea.com',
    phone: '9876543210',
    address: '123 Main St, City',
    loanAmount: 50000,  // Changed from 'amount' to 'loanAmount'
    purpose: 'Home Renovation',
    term: 24,
    monthlyIncome: 50000,
    employmentStatus: 'Employed',
    employer: 'ABC Company',
    bankDetails: {
      bankName: 'National Bank',
      accountNumber: '1234567890'
    },
    status: LoanStatus.VERIFIED,
    verifiedBy: 'verifier@creditsea.com',
    verificationDate: new Date('2024-03-20'),
    createdAt: new Date('2024-03-15')
  },
  {
    applicantName: 'Borrower User',
    email: 'borrower@creditsea.com',
    phone: '9876543210',
    address: '123 Main St, City',
    loanAmount: 100000,  // Changed from 'amount' to 'loanAmount'
    purpose: 'Business Investment',
    term: 36,
    monthlyIncome: 50000,
    employmentStatus: 'Employed',
    employer: 'ABC Company',
    bankDetails: {
      bankName: 'National Bank',
      accountNumber: '1234567890'
    },
    status: LoanStatus.APPROVED,
    verifiedBy: 'verifier@creditsea.com',
    verificationDate: new Date('2024-02-10'),
    approvedBy: 'admin@creditsea.com',
    approvalDate: new Date('2024-02-15'),
    createdAt: new Date('2024-02-01')
  },
  {
    applicantName: 'Borrower User',
    email: 'borrower@creditsea.com',
    phone: '9876543210',
    address: '123 Main St, City',
    loanAmount: 30000,  // Changed from 'amount' to 'loanAmount'
    purpose: 'Education',
    term: 12,
    monthlyIncome: 50000,
    employmentStatus: 'Employed',
    employer: 'ABC Company',
    bankDetails: {
      bankName: 'National Bank',
      accountNumber: '1234567890'
    },
    status: LoanStatus.REJECTED,
    verifiedBy: 'verifier@creditsea.com',
    verificationDate: new Date('2024-01-25'),
    rejectedBy: 'admin@creditsea.com',
    rejectionDate: new Date('2024-01-30'),
    rejectionReason: 'Insufficient income documentation provided.',
    createdAt: new Date('2024-01-20')
  }
];

// Seed function
// Modify your seed function to use the created user IDs:

const seedData = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await LoanApplication.deleteMany({});
    
    console.log('Previous data cleared');
    
    // Create users
    const admin = await User.create(adminUser);
    const verifier = await User.create(verifierUser);
    const borrower = await User.create(borrowerUser);
    
    console.log('Users created:');
    console.log(`Admin: ${admin.email}`);
    console.log(`Verifier: ${verifier.email}`);
    console.log(`Borrower: ${borrower.email}`);
    
    // Create general loan applications
    const loans = await LoanApplication.insertMany(sampleLoans);
    console.log(`${loans.length} general loan applications created`);
    
    // Create borrower's loan applications with proper references
    const borrowerLoanDocs = [
      {
        applicantName: 'Borrower User',
        email: 'borrower@creditsea.com',
        phone: '9876543210',
        address: '123 Main St, City',
        loanAmount: 25000,
        purpose: 'Personal Expenses',
        term: 12,
        monthlyIncome: 50000,
        employmentStatus: 'Employed',
        employer: 'ABC Company',
        bankDetails: {
          bankName: 'National Bank',
          accountNumber: '1234567890'
        },
        status: LoanStatus.PENDING,
        applicantId: borrower._id,
        createdAt: new Date('2024-03-01')
      },
      {
        applicantName: 'Borrower User',
        email: 'borrower@creditsea.com',
        phone: '9876543210',
        address: '123 Main St, City',
        loanAmount: 50000,
        purpose: 'Home Renovation',
        term: 24,
        monthlyIncome: 50000,
        employmentStatus: 'Employed',
        employer: 'ABC Company',
        bankDetails: {
          bankName: 'National Bank',
          accountNumber: '1234567890'
        },
        status: LoanStatus.VERIFIED,
        verifiedBy: verifier._id,  // Use actual user ID reference
        verificationDate: new Date('2024-03-20'),
        applicantId: borrower._id,
        createdAt: new Date('2024-03-15')
      },
      {
        applicantName: 'Borrower User',
        email: 'borrower@creditsea.com',
        phone: '9876543210',
        address: '123 Main St, City',
        loanAmount: 100000,
        purpose: 'Business Investment',
        term: 36,
        monthlyIncome: 50000,
        employmentStatus: 'Employed',
        employer: 'ABC Company',
        bankDetails: {
          bankName: 'National Bank',
          accountNumber: '1234567890'
        },
        status: LoanStatus.APPROVED,
        verifiedBy: verifier._id,  // Use actual user ID reference
        verificationDate: new Date('2024-02-10'),
        approvedBy: admin._id,  // Use actual user ID reference
        approvalDate: new Date('2024-02-15'),
        applicantId: borrower._id,
        createdAt: new Date('2024-02-01')
      },
      {
        applicantName: 'Borrower User',
        email: 'borrower@creditsea.com',
        phone: '9876543210',
        address: '123 Main St, City',
        loanAmount: 30000,
        purpose: 'Education',
        term: 12,
        monthlyIncome: 50000,
        employmentStatus: 'Employed',
        employer: 'ABC Company',
        bankDetails: {
          bankName: 'National Bank',
          accountNumber: '1234567890'
        },
        status: LoanStatus.REJECTED,
        verifiedBy: verifier._id,  // Use actual user ID reference
        verificationDate: new Date('2024-01-25'),
        rejectedBy: admin._id,  // Use actual user ID reference
        rejectionDate: new Date('2024-01-30'),
        rejectionReason: 'Insufficient income documentation provided.',
        applicantId: borrower._id,
        createdAt: new Date('2024-01-20')
      }
    ];
    
    const userLoans = await LoanApplication.insertMany(borrowerLoanDocs);
    console.log(`${userLoans.length} borrower loan applications created`);
    
    // Close connection
    await mongoose.disconnect();
    
    console.log('Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('Borrower User:');
    console.log('Email: borrower@creditsea.com');
    console.log('Password: Password123');
    console.log('\nVerifier User:');
    console.log('Email: verifier@creditsea.com');
    console.log('Password: Password123');
    console.log('\nAdmin User:');
    console.log('Email: admin@creditsea.com');
    console.log('Password: Password123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};
// Run the seed function
seedData();