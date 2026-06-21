import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/subscription.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/orders', requireAuth, createOrder);
router.post('/verify', requireAuth, verifyPayment);
export default router;
