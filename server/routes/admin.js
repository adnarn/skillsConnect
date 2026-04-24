import express from 'express';
import { getStats, getAllUsers, toggleUserActive, getAllBookings } from '../controllers/adminController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', auth, adminOnly, getStats);
router.get('/users', auth, adminOnly, getAllUsers);
router.patch('/users/:id/toggle-active', auth, adminOnly, toggleUserActive);
router.get('/bookings', auth, adminOnly, getAllBookings);

export default router;
