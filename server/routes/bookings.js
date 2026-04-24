import express from 'express';
import { 
  createBooking, 
  getClientBookings, 
  getWorkerBookings, 
  updateBookingStatus,
  getBookingById
} from '../controllers/bookingController.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, requireRole(['client']), createBooking);
router.get('/client', auth, requireRole(['client']), getClientBookings);
router.get('/worker', auth, requireRole(['worker']), getWorkerBookings);
router.get('/:id', auth, getBookingById);
router.put('/:id/status', auth, updateBookingStatus);

export default router;
