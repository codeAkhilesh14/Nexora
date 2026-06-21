import { Router } from 'express';
import { deleteMessage, getChatLimits, getMessages, listChats, reactToMessage, sendMessage } from '../controllers/chat.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', listChats);
router.get('/limits', getChatLimits);
router.get('/:chatId/messages', getMessages);
router.post('/:chatId/messages', sendMessage);
router.post('/messages/:messageId/reactions', reactToMessage);
router.delete('/messages/:messageId', deleteMessage);
export default router;
