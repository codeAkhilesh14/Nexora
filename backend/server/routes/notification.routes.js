import { Router } from 'express';
import {
  listNotifications,
  listLikeRequests,
  acceptLikeRequest,
  rejectLikeRequest,
  markRead
} from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', listNotifications);
router.get('/likes', listLikeRequests);
router.post('/likes/:id/accept', acceptLikeRequest);
router.post('/likes/:id/reject', rejectLikeRequest);
router.post('/read', markRead);
export default router;
