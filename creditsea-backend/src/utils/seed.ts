import dotenv from 'dotenv';
import connectDB from '../config/database';
import User, { UserRole } from '../models/User';
import LoanApplication, { LoanStatus } from '../models/LoanApplication';
import mongoose from 'mongoose';

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

// Seed function
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
    
    console.log('Users created:');
    console.log(`Admin: ${admin.email}`);
    console.log(`Verifier: ${verifier.email}`);
    
    // Create loan applications
    const loans = await LoanApplication.insertMany(sampleLoans);
    
    console.log(`${loans.length} loan applications created`);
    
    // Close connection
    await mongoose.disconnect();
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();