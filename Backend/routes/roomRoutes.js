import express from "express";
import { getRooms, createRoom, bulkCreateRooms, updateRoom, deleteRoom } from "../controllers/roomController.js";
import { protect, isAdminOrWarden } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getRooms);
router.post("/create", protect, isAdminOrWarden, createRoom);
router.post("/bulk", protect, isAdminOrWarden, bulkCreateRooms);
router.put("/:id", protect, isAdminOrWarden, updateRoom);
router.delete("/:id", protect, isAdminOrWarden, deleteRoom);

export default router;
