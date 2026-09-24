import { Router } from 'express';
import { getConversation, getMessages, sendMessage, getMyConversations } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/conversations', getMyConversations);
router.get('/order/:orderId', getConversation);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', sendMessage);

export default router;
