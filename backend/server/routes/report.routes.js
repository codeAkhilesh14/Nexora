import { Router } from 'express';
import { submitReport } from '../controllers/report.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.post('/', submitReport);

export default router;
