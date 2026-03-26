import express from 'express';
import { 
  getMenu, updateMenu, getTodayMenu, getAllMesses, deleteMess, renameMess,
  createMess, getMesses, updateMess, deleteMessInstance 
} from '../controllers/messController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', getAllMesses); // Return just unique IDs

router.use(protect);

// Mess Model CRUD (Internal usage/Management)
router.get('/list', getMesses);
router.post('/manage', authorize('admin', 'warden', 'chief-warden'), createMess);
router.patch('/manage/:id', authorize('admin', 'warden', 'chief-warden'), updateMess);
router.delete('/manage/:id', authorize('admin', 'warden', 'chief-warden'), deleteMessInstance);

router.get('/', getMenu);
router.get('/today', getTodayMenu);
router.post('/menu', authorize('admin', 'staff', 'warden', 'chief-warden'), updateMenu);
router.put('/rename', authorize('admin', 'staff', 'warden', 'chief-warden'), renameMess);
router.delete('/menu/:messId', authorize('admin', 'staff', 'warden', 'chief-warden'), deleteMess);

export default router;
