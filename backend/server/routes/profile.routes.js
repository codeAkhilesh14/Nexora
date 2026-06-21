import { Router } from 'express';
import { blockUser, unblockUser, revealIdentity, updateProfile, uploadAvatar, uploadRealPhoto } from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.use(requireAuth);
router.patch('/', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.post('/photo', upload.single('photo'), uploadRealPhoto);
router.post('/reveal', revealIdentity);
router.post('/block/:userId', blockUser);
router.post('/unblock/:userId', unblockUser);
export default router;
