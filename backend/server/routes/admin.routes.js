import { Router } from 'express';
import { dashboard, moderateUser, reports, upsertCollege, resolveReportStatus, supportRequests, resolveSupportStatus } from '../controllers/admin.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/dashboard', dashboard);
router.post('/colleges', upsertCollege);
router.patch('/users/:userId/status', moderateUser);
router.get('/reports', reports);
router.patch('/reports/:reportId/status', resolveReportStatus);
router.get('/support', supportRequests);
router.patch('/support/:supportId/resolve', resolveSupportStatus);
export default router;

