import express from 'express';
import { getWorkers, getWorkerById, updateWorkerProfile, updateAvailability } from '../controllers/workerController.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getWorkers);
router.get('/:id', getWorkerById);
router.put('/profile', auth, requireRole(['worker']), updateWorkerProfile);
router.put('/availability', auth, requireRole(['worker']), updateAvailability);

export default router;
