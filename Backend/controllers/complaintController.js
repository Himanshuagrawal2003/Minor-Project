import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

// ✅ CREATE COMPLAINT (Student)
export const createComplaint = async (req, res) => {
    try {
        console.log("Creating complaint for user:", req.user._id, req.user.role);
        const { title, description, category, priority } = req.body;

        const complaint = new Complaint({
            title,
            description,
            category,
            priority,
            studentId: req.user._id,
            studentName: req.user.name,
            room: req.body.room || "Unknown",
        });

        const createdComplaint = await complaint.save();
        console.log("Complaint created successfully:", createdComplaint._id);
        res.status(201).json(createdComplaint);
    } catch (err) {
        console.error("Complaint creation error:", err);
        res.status(500).json({ message: err.message });
    }
};

// ✅ GET COMPLAINTS (Role-based)
export const getComplaints = async (req, res) => {
    try {
        console.log("Fetching complaints for role:", req.user.role);
        let complaints;

        if (req.user.role === "student") {
            complaints = await Complaint.find({}).populate('studentId', 'name roomNumber customId').sort({ createdAt: -1 });
            console.log(`Found ${complaints.length} total complaints for student ${req.user._id} (Public View)`);
        } else if (req.user.role === "staff") {
            complaints = await Complaint.find({ assignedStaffId: req.user._id }).populate('studentId', 'name roomNumber customId').sort({ createdAt: -1 });
            console.log(`Found ${complaints.length} complaints assigned to staff ${req.user._id}`);
        } else {
            complaints = await Complaint.find({}).populate('studentId', 'name roomNumber customId').sort({ createdAt: -1 });
            console.log(`Found ${complaints.length} total complaints for management`);
        }

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
