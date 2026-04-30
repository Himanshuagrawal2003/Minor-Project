import Visitor from "../models/Visitor.js";
import User from "../models/User.js";
import { sendNotification } from "../utils/socket.js";

// ✅ ADD PROSPECTIVE STUDENT
export const createVisitor = async (req, res) => {
    try {
        const { name, email, phone, college, year, preferredRoomType, notes } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ message: "Name and Phone number are required." });
        }

        const visitor = new Visitor({
            name,
            email,
            phone,
            college,
            year,
            preferredRoomType,
            notes,
            addedBy: req.user?._id || null
        });

        const savedVisitor = await visitor.save();

        // Notify Warden about new inquiry
        await sendNotification({
            recipient: "warden", // Role-based room
            type: "visitor",
            title: "New Visitor Inquiry",
            message: `${name} has sent a new hostel inquiry.`,
            link: ""
        });

        res.status(201).json(savedVisitor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ GET ALL PROSPECTIVE STUDENTS
export const getVisitors = async (req, res) => {
    try {
        const visitors = await Visitor.find({}).sort({ createdAt: -1 });
        res.json(visitors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ UPDATE PROSPECTIVE STUDENT STATUS/INFO
export const updateVisitor = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const visitor = await Visitor.findByIdAndUpdate(id, updateData, { new: true });
        if (!visitor) {
            return res.status(404).json({ message: "Record not found" });
        }

        res.json(visitor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ DELETE RECORD
export const deleteVisitor = async (req, res) => {
    try {
        const { id } = req.params;
        await Visitor.findByIdAndDelete(id);
        res.json({ message: "Record deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ REGISTER VISITOR AS STUDENT
export const registerVisitorAsStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const visitor = await Visitor.findById(id);
        if (!visitor) {
            return res.status(404).json({ message: "Prospective student record not found" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: visitor.email });
        if (existingUser) {
            return res.status(400).json({ message: "A user with this email already exists." });
        }

        // Auto-generate ID
        const generatedId = `S-${Math.floor(1000 + Math.random() * 9000)}`;

        // Create new student user
        const newUser = new User({
            name: visitor.name,
            email: visitor.email || `${visitor.phone}@lumina.com`, // Fallback email if not provided
            contact: visitor.phone,
            role: "student",
            password: generatedId, // Default password is the generated ID
            customId: generatedId,
            isProfileComplete: false
        });

        await newUser.save();

        // Update visitor status
        visitor.status = 'allotted';
        await visitor.save();

        res.status(201).json({ message: "Student registered successfully", user: newUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
