import express from "express";
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getNotifications);

router.patch("/read-all", protect, markAllAsRead);

router.route("/:id")
  .delete(protect, deleteNotification);

router.patch("/:id/read", protect, markAsRead);

export default router;
