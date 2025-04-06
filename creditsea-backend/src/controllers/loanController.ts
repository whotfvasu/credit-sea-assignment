import { Request, Response } from 'express';
import LoanApplication, { LoanStatus } from '../models/LoanApplication';
import { UserRole } from '../models/User';

// Create a new loan application
export const createLoanApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { applicantName, email, phone, address, loanAmount, purpose } = req.body;

    const newApplication = new LoanApplication({
      applicantName,
      email,
      phone,
      address,
      loanAmount,
      purpose,
      status: LoanStatus.PENDING
    });

    await newApplication.save();

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
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    let query = {};
    
    // Verifiers can only see pending applications
    if (req.user.role === UserRole.VERIFIER) {
      query = { status: LoanStatus.PENDING };
    }
    
    // Admins can see verified applications pending approval
    if (req.user.role === UserRole.ADMIN) {
      query = { status: LoanStatus.VERIFIED };
    }

    const applications = await LoanApplication.find(query)
      .populate('verifiedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching loan applications:', error);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
};

// Get loan application by ID
export const getLoanApplicationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const application = await LoanApplication.findById(id)
      .populate('verifiedBy', 'name email')
      .populate('approvedBy', 'name email');
      
    if (!application) {
      res.status(404).json({ message: 'Loan application not found' });
      return;
    }
    
    res.status(200).json({ application });
  } catch (error) {
    console.error('Error fetching loan application:', error);
    res.status(500).json({ message: 'Server error while fetching application' });
  }
};

// Verify a loan application (Verifier only)
export const verifyLoanApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const application = await LoanApplication.findById(id);
    
    if (!application) {
      res.status(404).json({ message: 'Loan application not found' });
      return;
    }
    
    if (application.status !== LoanStatus.PENDING) {
      res.status(400).json({ message: 'Loan application is not in pending status' });
      return;
    }
    
    application.status = LoanStatus.VERIFIED;
    application.verifiedBy = req.user._id;
    application.verificationDate = new Date();
    
    await application.save();
    
    res.status(200).json({
      message: 'Loan application verified successfully',
      application
    });
  } catch (error) {
    console.error('Error verifying loan application:', error);
    res.status(500).json({ message: 'Server error while verifying application' });
  }
};

// Reject a loan application (Verifier for pending, Admin for verified)
export const rejectLoanApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const application = await LoanApplication.findById(id);
    
    if (!application) {
      res.status(404).json({ message: 'Loan application not found' });
      return;
    }
    
    // Verifiers can only reject pending applications
    if (req.user.role === UserRole.VERIFIER && application.status !== LoanStatus.PENDING) {
      res.status(400).json({ message: 'Verifiers can only reject pending applications' });
      return;
    }
    
    // Admins can only reject verified applications
    if (req.user.role === UserRole.ADMIN && application.status !== LoanStatus.VERIFIED) {
      res.status(400).json({ message: 'Admins can only reject verified applications' });
      return;
    }
    
    application.status = LoanStatus.REJECTED;
    application.rejectionReason = rejectionReason;
    
    if (req.user.role === UserRole.VERIFIER) {
      application.verifiedBy = req.user._id;
      application.verificationDate = new Date();
    } else if (req.user.role === UserRole.ADMIN) {
      application.approvedBy = req.user._id;
      application.approvalDate = new Date();
    }
    
    await application.save();
    
    res.status(200).json({
      message: 'Loan application rejected successfully',
      application
    });
  } catch (error) {
    console.error('Error rejecting loan application:', error);
    res.status(500).json({ message: 'Server error while rejecting application' });
  }
};

// Approve a loan application (Admin only)
export const approveLoanApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const application = await LoanApplication.findById(id);
    
    if (!application) {
      res.status(404).json({ message: 'Loan application not found' });
      return;
    }
    
    if (application.status !== LoanStatus.VERIFIED) {
      res.status(400).json({ message: 'Only verified applications can be approved' });
      return;
    }
    
    application.status = LoanStatus.APPROVED;
    application.approvedBy = req.user._id;
    application.approvalDate = new Date();
    
    await application.save();
    
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
    if (!req.user) {
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