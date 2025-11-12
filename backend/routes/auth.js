import express from 'express';
import { simpleAuth, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiting.js';

const router = express.Router();

router.post('/login', authLimiter, simpleAuth);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

export default router;