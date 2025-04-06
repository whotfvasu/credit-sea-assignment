import { Router } from 'express';
import * as loanController from '../controllers/loanController';
import { auth, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Public route for submitting applications
router.post('/', loanController.createLoanApplication);

// Protected routes - accessible by both verifiers and admins
router.get('/', auth, loanController.getAllLoanApplications);
router.get('/dashboard', auth, loanController.getDashboardStats);
router.get('/:id', auth, loanController.getLoanApplicationById);

// Verifier routes
router.put('/:id/verify', auth, authorize([UserRole.VERIFIER]), loanController.verifyLoanApplication);
router.put('/:id/reject-verifier', auth, authorize([UserRole.VERIFIER]), loanController.rejectLoanApplication);

// Admin routes
router.put('/:id/approve', auth, authorize([UserRole.ADMIN]), loanController.approveLoanApplication);
router.put('/:id/reject-admin', auth, authorize([UserRole.ADMIN]), loanController.rejectLoanApplication);

export default router;