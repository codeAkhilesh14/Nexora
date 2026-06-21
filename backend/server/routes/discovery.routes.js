import { Router } from 'express';
import { getDeck, getSwipeLimits, matches, rewind, swipe, updateRadar, getRadarZoneUsers } from '../controllers/discovery.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get('/deck', getDeck);
router.get('/limits', getSwipeLimits);
router.get('/radar/users', getRadarZoneUsers);
router.post('/swipe', swipe);
router.post('/rewind', rewind);
router.get('/matches', matches);
router.post('/radar', updateRadar);
export default router;
