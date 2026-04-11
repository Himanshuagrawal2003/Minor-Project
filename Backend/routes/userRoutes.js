import express from "express";
import {
    createUser,
    getUsers,
    deleteUser,
    bulkCreateUsers,
    bulkDeleteUsers,
    loginUser,
    updateProfile,
    allotRoom,
    changePassword,
    forgotPassword,
    getWardenPerformance,
    getRoommates,
} from "../controllers/userController.js";

import { protect, isAdmin, isAdminOrWarden } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 AUTH
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.patch("/update-profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);

// 👤 PROFILE
router.get("/profile", protect, (req, res) => {
    res.json(req.user);
});

router.get("/roommates", protect, getRoommates);


router.post("/create", protect, isAdmin, createUser);
router.post("/bulk", protect, isAdmin, bulkCreateUsers);
router.post("/bulk-delete", protect, isAdmin, bulkDeleteUsers);
router.delete("/:id", protect, isAdmin, deleteUser);

router.get("/", protect, getUsers);
router.get("/warden-performance", protect, getWardenPerformance);
router.patch("/:id/allot", protect, isAdminOrWarden, allotRoom);

export default router; 