import express from 'express';
import { getMessages, sendMessage, getUnreadCount, markAsRead } from '../controllers/chatController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/messages/:bookingId', auth, getMessages);
router.post('/messages/:bookingId', auth, sendMessage);
router.get('/unread-count', auth, getUnreadCount);
router.patch('/read/:bookingId', auth, markAsRead);

export default router;
