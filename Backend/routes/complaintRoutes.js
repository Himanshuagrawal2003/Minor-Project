import express from "express";
import {
    createComplaint,
    getComplaints,
    updateComplaint,
    getStaffMembers,
} from "../controllers/complaintController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📝 ALL USERS (Fetch list)
router.get("/", protect, getComplaints);

// 📝 STUDENT (Raise complaint)
router.post("/", protect, createComplaint);

// 📝 ADMIN/WARDEN (Update status/remarks/assignment)
router.patch("/:id", protect, updateComplaint);

// 🛠️ UTILS (Get staff list for assignment)
router.get("/staff", protect, getStaffMembers);

export default router;
