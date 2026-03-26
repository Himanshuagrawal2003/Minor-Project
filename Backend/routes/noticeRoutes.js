import express from 'express';
import { getNotices, createNotice, deleteNotice } from '../controllers/noticeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotices);
router.post('/', authorize('admin', 'warden', 'chief-warden'), createNotice);
router.delete('/:id', authorize('admin', 'warden', 'chief-warden'), deleteNotice);

export default router;
