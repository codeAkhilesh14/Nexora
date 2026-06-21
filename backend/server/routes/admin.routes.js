import { Router } from 'express';
import { dashboard, moderateUser, reports, upsertCollege } from '../controllers/admin.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/dashboard', dashboard);
router.post('/colleges', upsertCollege);
router.patch('/users/:userId/status', moderateUser);
router.get('/reports', reports);
export default router;
