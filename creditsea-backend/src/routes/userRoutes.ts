import { Router } from 'express';
import * as userController from '../controllers/userController';
import { auth, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { getProfile } from '../controllers/authController';

const router = Router();

// Admin only routes
router.get('/all', auth, authorize([UserRole.ADMIN]), userController.getAllUsers);
router.get('/admins', auth, authorize([UserRole.ADMIN]), userController.getAllAdmins);
router.post('/admin', auth, authorize([UserRole.ADMIN]), userController.createAdmin);
router.delete('/:userId', auth, authorize([UserRole.ADMIN]), userController.deleteUser);
router.get('/profile', auth, getProfile);
export default router;