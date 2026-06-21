import { Router } from 'express';
import { joinRoom, listRooms, getRoomMessages, sendRoomMessage } from '../controllers/room.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', listRooms);
router.post('/:roomId/join', joinRoom);
router.get('/:roomId/messages', getRoomMessages);
router.post('/:roomId/messages', sendRoomMessage);
export default router;
