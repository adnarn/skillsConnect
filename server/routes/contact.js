import express from 'express';
import { submitContact } from '../controllers/contactController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, submitContact);

export default router;
