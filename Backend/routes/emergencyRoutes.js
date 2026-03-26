import express from 'express';
import { getEmergencies, createEmergency, updateEmergencyStatus } from '../controllers/emergencyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getEmergencies);
router.post('/', authorize('student'), createEmergency);
router.patch('/:id', authorize('warden', 'admin'), updateEmergencyStatus);

export default router;
