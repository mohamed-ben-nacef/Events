import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  updateProfileValidator,
} from '../validators/auth.validator';
import {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
} from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.post('/register', registerLimiter, validate(registerValidator), register);
router.post('/login', loginLimiter, validate(loginValidator), login);
router.post('/refresh-token', validate(refreshTokenValidator), refreshToken);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordValidator), forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordValidator), resetPassword);
router.post('/verify-email', verifyEmail);

// Protected routes (require authentication)
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, validate(updateProfileValidator), updateProfile);
router.put('/change-password', authenticate, validate(changePasswordValidator), changePassword);
router.post('/resend-verification', authenticate, resendVerificationEmail);

export default router;
