import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

export const createComplaint = async (req, res) => {
    try {
        console.log("Creating complaint for user:", req.user._id, req.user.role);
        const { title, description, category, priority } = req.body;
        
        if (!title || !description || !category || !priority) {
            return res.status(400).json({ message: "All fields are required (Title, Description, Category, Priority)." });
        }

        const complaint = new Complaint({
            title,
            description,
            category,
            priority,
            studentId: req.user._id,
            studentName: req.user.name,
            room: req.user.roomNumber || "Unknown",
            block: req.user.block || "Unknown", // Correctly save the student's actual block
        });

        const createdComplaint = await complaint.save();
        console.log("Complaint created successfully:", createdComplaint._id);
        res.status(201).json(createdComplaint);
    } catch (err) {
        console.error("Complaint creation error:", err);
        res.status(500).json({ message: err.message });
    }
};

export const getComplaints = async (req, res) => {
    try {
        console.log("Fetching all complaints for role:", req.user.role);
        
        // Return all complaints for everyone to see (Community Board)
        const complaints = await Complaint.find({})
            .populate('studentId', 'name roomNumber customId')
            .sort({ createdAt: -1 });

        console.log(`Found ${complaints.length} total complaints for ${req.user.role}`);
        res.json(complaints);
    } catch (err) {
        console.error("Fetch complaints error:", err);
        res.status(500).json({ message: err.message });
    }
};

// ✅ UPDATE COMPLAINT (Admin/Warden)
export const updateComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks, assignedStaffId } = req.body;

        const complaint = await Complaint.findById(id);

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        if (status) complaint.status = status;
        if (remarks) complaint.remarks = remarks;
        if (assignedStaffId) complaint.assignedStaffId = assignedStaffId;

        const updatedComplaint = await complaint.save();
        res.json(updatedComplaint);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ GET STAFF MEMBERS (For assignment)
export const getStaffMembers = async (req, res) => {
    try {
        const staff = await User.find({ role: "staff" }).select("name _id extra");
        res.json(staff);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
