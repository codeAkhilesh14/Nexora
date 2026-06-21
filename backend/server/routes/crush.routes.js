import { Router } from 'express';
import { addCrush, listCrushes } from '../controllers/crush.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', listCrushes);
router.post('/', addCrush);
export default router;
