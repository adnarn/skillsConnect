import express from 'express';
import { submitKYC, getMyKYCStatus, getAllKYC, reviewKYC } from '../controllers/kycController.js';
import { auth, requireRole, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/submit', auth, requireRole(['worker']), upload.fields([{ name: 'idPhoto' }, { name: 'selfie' }]), submitKYC);
router.get('/my-status', auth, requireRole(['worker']), getMyKYCStatus);
router.get('/all', auth, adminOnly, getAllKYC);
router.patch('/:id/review', auth, adminOnly, reviewKYC);

export default router;
