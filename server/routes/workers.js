import express from 'express';
import { getWorkers, getWorkerById, updateWorkerProfile, updateAvailability, updateVisibility, updateLocation, getVisibleWorkers } from '../controllers/workerController.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getWorkers);
router.get('/visible', getVisibleWorkers);
router.get('/:id', getWorkerById);
router.put('/profile', auth, requireRole(['worker']), updateWorkerProfile);
router.put('/availability', auth, requireRole(['worker']), updateAvailability);
router.patch('/visibility', auth, requireRole(['worker']), updateVisibility);
router.patch('/location', auth, requireRole(['worker']), updateLocation);

export default router;
