import express from "express";
import { 
    createVisitor, 
    getVisitors, 
    updateVisitor, 
    deleteVisitor, 
    registerVisitorAsStudent 
} from "../controllers/visitorController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route for enquiries (from Login page)
router.post("/", createVisitor);

// Protected routes for Warden/Admin
router.use(protect);
router.use(authorize("admin", "warden", "chief-warden"));

router.get("/", getVisitors);

router.route("/:id")
    .patch(updateVisitor)
    .delete(deleteVisitor);

router.post("/:id/register", registerVisitorAsStudent);

export default router;
