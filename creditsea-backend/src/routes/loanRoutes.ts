import { Router } from 'express';
import * as loanController from '../controllers/loanController';
import { auth, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// User routes
router.post('/apply', auth, loanController.submitLoanApplication);
router.get('/user', auth, loanController.getUserLoanApplications);

// Verifier routes
router.get('/', auth, authorize([UserRole.VERIFIER, UserRole.ADMIN]), loanController.getAllLoanApplications);
router.get('/:id', auth, loanController.getLoanApplicationById);
router.put('/:id/verify', auth, authorize([UserRole.VERIFIER]), loanController.verifyLoanApplication);
router.put('/:id/reject-verifier', auth, authorize([UserRole.VERIFIER]), loanController.rejectLoanApplication);

// Admin routes
router.put('/:id/approve', auth, authorize([UserRole.ADMIN]), loanController.approveLoanApplication);
router.put('/:id/reject-admin', auth, authorize([UserRole.ADMIN]), loanController.rejectLoanApplication);

// Dashboard stats
router.get('/dashboard', auth, loanController.getDashboardStats);

export default router;