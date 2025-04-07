import { Request, Response } from 'express';
import mongoose from 'mongoose';
import LoanApplication, { LoanStatus } from '../models/LoanApplication';
import { UserRole } from '../models/User';


export const createLoanApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Creating loan application with data:", req.body);
    
    // Create a new object with properly renamed fields
    const applicationData = {
      applicantName: req.body.applicantName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      loanAmount: req.body.amount || req.body.loanAmount, // Accept either name
      purpose: req.body.purpose,
      status: LoanStatus.PENDING
    };
    
    // Log the processed data
    console.log("Processed application data:", applicationData);
    
    // Check explicitly for loanAmount
    if (!applicationData.loanAmount) {
      console.error("Missing loanAmount in processed data");
      return res.status(400).json({ message: 'Loan amount is required' });
    }

    // Create new application
    const newApplication = new LoanApplication(applicationData);

    // Save to database
    await newApplication.save();
    console.log("Loan application created with ID:", newApplication.id);

    res.status(201).json({
      message: 'Loan application submitted successfully',
      application: newApplication
    });
  } catch (error) {
    console.error('Error creating loan application:', error);
    res.status(500).json({ message: 'Server error while submitting application' });
  }
};

// Get all loan applications based on user role
export const getAllLoanApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Getting all loan applications for user:", req.user?.id);
    
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Define query based on role (for debugging, we're not filtering by role)
    let query = {};
    
    // Get all applications with populated user refs
    const applications = await LoanApplication.find(query)
      .populate('verifiedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    console.log(`Found ${applications.length} loan applications`);
    res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching loan applications:', error);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
};

// Get loan application by ID with ObjectId validation
export const getLoanApplicationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log("Getting loan application with ID:", id);

    // Validate id before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid loan application id' });
      return;
    }
    
    const application = await LoanApplication.findById(id)
      .populate('verifiedBy', 'name email')
      .populate('approvedBy', 'name email');
      
    if (!application) {
      console.log("Loan application not found with ID:", id);
      res.status(404).json({ message: 'Loan application not found' });
      return;
    }
    
    console.log("Loan application found:", application);
    res.status(200).json({ application });
  } catch (error) {
    console.error('Error fetching loan application:', error);
    res.status(500).json({ message: 'Server error while fetching application' });
  }
};

// Verify a loan application (Verifier only) with id validation
export const verifyLoanApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Verify loan called with ID:", req.params.id);
    const { id } = req.params;
    
    if (!req.user) {
      console.log("No authenticated user found");
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    // Validate id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid loan application id' });
      return;
    }
    
    // Find the application
    const application = await LoanApplication.findById(id);
    
    if (!application) {
      console.log("Loan application not found with ID:", id);
      res.status(404).json({ message: 'Loan application not found' });
      return;
    }
    
    console.log("Found loan application:", application);
    
    if (application.status !== LoanStatus.PENDING) {
      console.log("Loan application is not in pending status. Current status:", application.status);
      res.status(400).json({ message: 'Loan application is not in pending status' });
      return;
    }
    
    console.log("Updating loan application status to VERIFIED");
    application.status = LoanStatus.VERIFIED;
    application.verifiedBy = req.user._id;
    application.verificationDate = new Date();
    
    // Save the updated application
    await application.save();
    console.log("Loan application verified successfully");
    
    // Return the updated application
    res.status(200).json({
      message: 'Loan application verified successfully',
      application
    });
  } catch (error) {
    console.error('Error verifying loan application:', error);
    res.status(500).json({ message: 'Server error while verifying application' });
  }
};

// Reject a loan application (Verifier for pending, Admin for verified) with id validation
export const rejectLoanApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Reject loan called with ID:", req.params.id);
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    console.log("Rejection reason:", rejectionReason);
    
    if (!rejectionReason) {
      console.log("Rejection reason is missing");
      res.status(400).json({ message: 'Rejection reason is required' });
      return;
    }
    
    if (!req.user) {
      console.log("No authenticated user found");
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    // Validate id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid loan application id' });
      return;
    }
    
    const application = await LoanApplication.findById(id);
    
    if (!application) {
      console.log("Loan application not found with ID:", id);
      res.status(404).json({ message: 'Loan application not found' });
      return;
    }
    
    console.log("Found loan application:", application);
    
    console.log("Updating loan application status to REJECTED with reason:", rejectionReason);
    application.status = LoanStatus.REJECTED;
    application.rejectionReason = rejectionReason;
    
    // Set the appropriate user as the one who rejected
    if (req.user.role === UserRole.VERIFIER) {
      application.verifiedBy = req.user._id;
      application.verificationDate = new Date();
    } else if (req.user.role === UserRole.ADMIN) {
      application.approvedBy = req.user._id;
      application.approvalDate = new Date();
    }
    
    await application.save();
    console.log("Loan application rejected successfully");
    
    res.status(200).json({
      message: 'Loan application rejected successfully',
      application
    });
  } catch (error) {
    console.error('Error rejecting loan application:', error);
    res.status(500).json({ message: 'Server error while rejecting application' });
  }
};

// Approve a loan application (Admin only) with id validation
export const approveLoanApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Approve loan called with ID:", req.params.id);
    const { id } = req.params;
    
    if (!req.user) {
      console.log("No authenticated user found");
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    // Validate id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid loan application id' });
      return;
    }
    
    const application = await LoanApplication.findById(id);
    
    if (!application) {
      console.log("Loan application not found with ID:", id);
      res.status(404).json({ message: 'Loan application not found' });
      return;
    }
    
    console.log("Found loan application:", application);
    
    if (application.status !== LoanStatus.VERIFIED) {
      console.log("Only verified applications can be approved. Current status:", application.status);
      res.status(400).json({ message: 'Only verified applications can be approved' });
      return;
    }
    
    console.log("Updating loan application status to APPROVED");
    application.status = LoanStatus.APPROVED;
    application.approvedBy = req.user._id;
    application.approvalDate = new Date();
    
    await application.save();
    console.log("Loan application approved successfully");
    
    res.status(200).json({
      message: 'Loan application approved successfully',
      application
    });
  } catch (error) {
    console.error('Error approving loan application:', error);
    res.status(500).json({ message: 'Server error while approving application' });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Getting dashboard statistics");
    
    if (!req.user) {
      console.log("No authenticated user found");
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    // Count applications by status
    const totalPending = await LoanApplication.countDocuments({ status: LoanStatus.PENDING });
    const totalVerified = await LoanApplication.countDocuments({ status: LoanStatus.VERIFIED });
    const totalApproved = await LoanApplication.countDocuments({ status: LoanStatus.APPROVED });
    const totalRejected = await LoanApplication.countDocuments({ status: LoanStatus.REJECTED });
    const totalApplications = await LoanApplication.countDocuments();
    
    // Calculate total loan amount
    const totalLoanAmountResult = await LoanApplication.aggregate([
      { $match: { status: LoanStatus.APPROVED } },
      { $group: { _id: null, total: { $sum: '$loanAmount' } } }
    ]);
    
    const totalLoanAmount = totalLoanAmountResult.length > 0 ? totalLoanAmountResult[0].total : 0;
    
    // Get recent applications
    const recentApplications = await LoanApplication.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('verifiedBy', 'name')
      .populate('approvedBy', 'name');
    
    // Get monthly application counts
    const monthlyData = await LoanApplication.aggregate([
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' }, 
            year: { $year: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    console.log("Dashboard statistics:", {
      totalPending,
      totalVerified,
      totalApproved,
      totalRejected,
      totalApplications,
      totalLoanAmount
    });
    
    res.status(200).json({
      stats: {
        totalPending,
        totalVerified,
        totalApproved,
        totalRejected,
        totalApplications,
        totalLoanAmount,
        recentApplications,
        monthlyData
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics' });
  }
};
