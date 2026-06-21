import { Router } from 'express';
import { forgotPassword, login, logout, me, refresh, resendOtp, resetPassword, signup, verifyOtp } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { emailSchema, loginSchema, otpSchema, resetPasswordSchema, signupSchema } from '../validators/auth.validators.js';

const router = Router();
import { authLimiter } from '../middleware/rateLimit.middleware.js';

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/verify-otp', validate(otpSchema), verifyOtp);
router.post('/resend-otp', authLimiter, validate(emailSchema), resendOtp);
router.post('/refresh', refresh);
router.post('/forgot-password', authLimiter, validate(emailSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);
export default router;
