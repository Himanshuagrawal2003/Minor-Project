import express from 'express';
import { getLeaves, createLeaveRequest, updateLeaveStatus } from '../controllers/leaveController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getLeaves);
router.post('/', authorize('student'), createLeaveRequest);
router.patch('/:id', authorize('warden', 'chief-warden', 'admin'), updateLeaveStatus);

export default router;
