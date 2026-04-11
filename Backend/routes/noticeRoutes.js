import express from 'express';
import multer from 'multer';
import path from 'path';
import { getNotices, createNotice, deleteNotice } from '../controllers/noticeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/notices/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(protect);

router.get('/', getNotices);
router.post('/', authorize('admin', 'warden', 'chief-warden'), upload.single('attachment'), createNotice);
router.delete('/:id', authorize('admin', 'warden', 'chief-warden'), deleteNotice);

export default router;
