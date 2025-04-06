import { Router } from 'express';
import * as authController from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', auth, authController.getProfile);

export default router;