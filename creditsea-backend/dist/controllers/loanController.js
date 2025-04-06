"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.approveLoanApplication = exports.rejectLoanApplication = exports.verifyLoanApplication = exports.getLoanApplicationById = exports.getAllLoanApplications = exports.createLoanApplication = void 0;
const LoanApplication_1 = __importStar(require("../models/LoanApplication"));
const User_1 = require("../models/User");
// Create a new loan application
const createLoanApplication = async (req, res) => {
    try {
        const { applicantName, email, phone, address, loanAmount, purpose } = req.body;
        const newApplication = new LoanApplication_1.default({
            applicantName,
            email,
            phone,
            address,
            loanAmount,
            purpose,
            status: LoanApplication_1.LoanStatus.PENDING
        });
        await newApplication.save();
        res.status(201).json({
            message: 'Loan application submitted successfully',
            application: newApplication
        });
    }
    catch (error) {
        console.error('Error creating loan application:', error);
        res.status(500).json({ message: 'Server error while submitting application' });
    }
};
exports.createLoanApplication = createLoanApplication;
// Get all loan applications based on user role
const getAllLoanApplications = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        let query = {};
        // Verifiers can only see pending applications
        if (req.user.role === User_1.UserRole.VERIFIER) {
            query = { status: LoanApplication_1.LoanStatus.PENDING };
        }
        // Admins can see verified applications pending approval
        if (req.user.role === User_1.UserRole.ADMIN) {
            query = { status: LoanApplication_1.LoanStatus.VERIFIED };
        }
        const applications = await LoanApplication_1.default.find(query)
            .populate('verifiedBy', 'name email')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ applications });
    }
    catch (error) {
        console.error('Error fetching loan applications:', error);
        res.status(500).json({ message: 'Server error while fetching applications' });
    }
};
exports.getAllLoanApplications = getAllLoanApplications;
// Get loan application by ID
const getLoanApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await LoanApplication_1.default.findById(id)
            .populate('verifiedBy', 'name email')
            .populate('approvedBy', 'name email');
        if (!application) {
            res.status(404).json({ message: 'Loan application not found' });
            return;
        }
        res.status(200).json({ application });
    }
    catch (error) {
        console.error('Error fetching loan application:', error);
        res.status(500).json({ message: 'Server error while fetching application' });
    }
};
exports.getLoanApplicationById = getLoanApplicationById;
// Verify a loan application (Verifier only)
const verifyLoanApplication = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const application = await LoanApplication_1.default.findById(id);
        if (!application) {
            res.status(404).json({ message: 'Loan application not found' });
            return;
        }
        if (application.status !== LoanApplication_1.LoanStatus.PENDING) {
            res.status(400).json({ message: 'Loan application is not in pending status' });
            return;
        }
        application.status = LoanApplication_1.LoanStatus.VERIFIED;
        application.verifiedBy = req.user._id;
        application.verificationDate = new Date();
        await application.save();
        res.status(200).json({
            message: 'Loan application verified successfully',
            application
        });
    }
    catch (error) {
        console.error('Error verifying loan application:', error);
        res.status(500).json({ message: 'Server error while verifying application' });
    }
};
exports.verifyLoanApplication = verifyLoanApplication;
// Reject a loan application (Verifier for pending, Admin for verified)
const rejectLoanApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const application = await LoanApplication_1.default.findById(id);
        if (!application) {
            res.status(404).json({ message: 'Loan application not found' });
            return;
        }
        // Verifiers can only reject pending applications
        if (req.user.role === User_1.UserRole.VERIFIER && application.status !== LoanApplication_1.LoanStatus.PENDING) {
            res.status(400).json({ message: 'Verifiers can only reject pending applications' });
            return;
        }
        // Admins can only reject verified applications
        if (req.user.role === User_1.UserRole.ADMIN && application.status !== LoanApplication_1.LoanStatus.VERIFIED) {
            res.status(400).json({ message: 'Admins can only reject verified applications' });
            return;
        }
        application.status = LoanApplication_1.LoanStatus.REJECTED;
        application.rejectionReason = rejectionReason;
        if (req.user.role === User_1.UserRole.VERIFIER) {
            application.verifiedBy = req.user._id;
            application.verificationDate = new Date();
        }
        else if (req.user.role === User_1.UserRole.ADMIN) {
            application.approvedBy = req.user._id;
            application.approvalDate = new Date();
        }
        await application.save();
        res.status(200).json({
            message: 'Loan application rejected successfully',
            application
        });
    }
    catch (error) {
        console.error('Error rejecting loan application:', error);
        res.status(500).json({ message: 'Server error while rejecting application' });
    }
};
exports.rejectLoanApplication = rejectLoanApplication;
// Approve a loan application (Admin only)
const approveLoanApplication = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const application = await LoanApplication_1.default.findById(id);
        if (!application) {
            res.status(404).json({ message: 'Loan application not found' });
            return;
        }
        if (application.status !== LoanApplication_1.LoanStatus.VERIFIED) {
            res.status(400).json({ message: 'Only verified applications can be approved' });
            return;
        }
        application.status = LoanApplication_1.LoanStatus.APPROVED;
        application.approvedBy = req.user._id;
        application.approvalDate = new Date();
        await application.save();
        res.status(200).json({
            message: 'Loan application approved successfully',
            application
        });
    }
    catch (error) {
        console.error('Error approving loan application:', error);
        res.status(500).json({ message: 'Server error while approving application' });
    }
};
exports.approveLoanApplication = approveLoanApplication;
// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        // Count applications by status
        const totalPending = await LoanApplication_1.default.countDocuments({ status: LoanApplication_1.LoanStatus.PENDING });
        const totalVerified = await LoanApplication_1.default.countDocuments({ status: LoanApplication_1.LoanStatus.VERIFIED });
        const totalApproved = await LoanApplication_1.default.countDocuments({ status: LoanApplication_1.LoanStatus.APPROVED });
        const totalRejected = await LoanApplication_1.default.countDocuments({ status: LoanApplication_1.LoanStatus.REJECTED });
        const totalApplications = await LoanApplication_1.default.countDocuments();
        // Calculate total loan amount
        const totalLoanAmountResult = await LoanApplication_1.default.aggregate([
            { $match: { status: LoanApplication_1.LoanStatus.APPROVED } },
            { $group: { _id: null, total: { $sum: '$loanAmount' } } }
        ]);
        const totalLoanAmount = totalLoanAmountResult.length > 0 ? totalLoanAmountResult[0].total : 0;
        // Get recent applications
        const recentApplications = await LoanApplication_1.default.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('verifiedBy', 'name')
            .populate('approvedBy', 'name');
        // Get monthly application counts
        const monthlyData = await LoanApplication_1.default.aggregate([
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
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard statistics' });
    }
};
exports.getDashboardStats = getDashboardStats;
