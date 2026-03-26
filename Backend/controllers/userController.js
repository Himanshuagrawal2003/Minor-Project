import User from "../models/User.js";
import Complaint from "../models/Complaint.js";
import Emergency from "../models/Emergency.js";
import Leave from "../models/Leave.js";
import Room from "../models/Room.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ CREATE USER (Manual)
export const createUser = async (req, res) => {
    try {
        const { name, email, contact, role, extra } = req.body;

        const prefix = role === "student" ? "S" : role === "warden" ? "W" : role === "chief-warden" ? "CW" : role === "staff" ? "ST" : "U";
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const customId = `${prefix}-${randomNum}`;

        let userData = {
            name,
            customId,
            role,
            password: customId,
        };

        // staff → contact, others → email
        if (role === "staff") userData.contact = contact;
        else userData.email = email;

        // role-based mapping (frontend extra field)
        if (role === "student") userData.course = extra;
        if (role === "warden") userData.block = extra;
        if (role === "chief-warden") userData.department = extra;
        if (role === "staff") userData.department = extra;

        const user = await User.create(userData);

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
            },
            tempPassword: customId, // 🔥 frontend me dikhana
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ GET USERS
export const getUsers = async (req, res) => {
    try {
        const { role } = req.query;

        const users = await User.find(role ? { role } : {})
            .select("-password")
            .sort({ createdAt: -1 });

        res.json({ users });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ DELETE USER
export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);

        res.json({ message: "User deleted" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ BULK CREATE
export const bulkCreateUsers = async (req, res) => {
    try {
        const { users, role } = req.body;

        const created = [];

        for (let u of users) {
            const prefix = role === "student" ? "S" : role === "warden" ? "W" : role === "chief-warden" ? "CW" : role === "staff" ? "ST" : "U";
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const customId = u.id || `${prefix}-${randomNum}`;

            let userData = {
                name: u.name,
                customId,
                role,
                password: customId,
            };

            if (role === "staff") userData.contact = u.contact;
            else userData.email = u.email;

            if (role === "student") userData.course = u.extra;
            if (role === "warden") userData.block = u.extra;
            if (role === "chief-warden") userData.department = u.extra;
            if (role === "staff") userData.department = u.extra;

            const newUser = await User.create(userData);

            created.push({
                id: newUser._id,
                name: newUser.name,
                tempPassword: customId,
            });
        }

        res.json({
            count: created.length,
            users: created,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ LOGIN USER
export const loginUser = async (req, res) => {
    try {
        const { email, contact, customId, password, role } = req.body;

        const identifier = email || contact || customId;

        // Find by email or contact or customId
        const user = await User.findOne({
            $or: [{ email: identifier }, { contact: identifier }, { customId: identifier }],
        });

        if (user && (await user.matchPassword(password))) {
            // Role matching check
            if (role && user.role !== role) {
                return res.status(401).json({ 
                    message: `Role mismatch: You are registered as ${user.role}, but trying to login as ${role}.` 
                });
            }

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "30d",
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isProfileComplete: user.isProfileComplete || false,
                roomNumber: user.roomNumber || "",
                block: user.block || "",
                messId: user.messId || "",
                token,
            });
        } else {
            res.status(401).json({ message: "Invalid email/id or password" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ ALLOT ROOM (Admin Only)
export const allotRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomNumber, block, messId } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (roomNumber) {
            const room = await Room.findOne({ number: roomNumber });
            if (!room) {
                return res.status(404).json({ message: "Specified room not found" });
            }

            // Check how many students are already in this room
            const currentOccupancy = await User.countDocuments({ roomNumber, _id: { $ne: id } });
            if (currentOccupancy >= room.capacity) {
                return res.status(400).json({ message: `Room ${roomNumber} is already full (Capacity: ${room.capacity})` });
            }
            
            user.roomNumber = roomNumber;
        } else if (roomNumber === "") {
            user.roomNumber = "";
        }

        if (block !== undefined) user.block = block;
        if (messId !== undefined) user.messId = messId;
        
        await user.save();
        res.json({ message: "Room allotted successfully", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ UPDATE PROFILE
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.contact = req.body.contact || user.contact;
            user.course = req.body.course || user.course;
            user.block = req.body.block || user.block;
            user.department = req.body.department || user.department;
            user.roomNumber = req.body.roomNumber || user.roomNumber;
            user.isProfileComplete = true; // Mark as complete after update

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isProfileComplete: updatedUser.isProfileComplete,
                contact: updatedUser.contact,
                course: updatedUser.course,
                block: updatedUser.block,
                department: updatedUser.department,
                roomNumber: updatedUser.roomNumber
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ BULK DELETE
export const bulkDeleteUsers = async (req, res) => {
    try {
        const { ids } = req.body;

        const result = await User.deleteMany({
            $or: [
                { _id: { $in: ids } },
                { customId: { $in: ids } }
            ]
        });

        res.json({
            message: `Successfully deleted ${result.deletedCount} users`,
            count: result.deletedCount
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ CHANGE PASSWORD
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword; // Hashing handled by pre-save hook
            await user.save();
            res.json({ success: true, message: "Password updated successfully" });
        } else {
            res.status(401).json({ message: "Invalid current password" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ FORGOT PASSWORD (RESET TO DEFAULT)
export const forgotPassword = async (req, res) => {
    try {
        const { email, customId } = req.body;
        const user = await User.findOne({ email, customId });

        if (!user) {
            return res.status(404).json({ message: "No user found with this email and ID combination." });
        }

        // Reset password to a default one
        user.password = "123456"; 
        await user.save();

        res.json({ 
            success: true, 
            message: "Password has been reset to 123456. Please login and change it immediately." 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ WARDEN PERFORMANCE Aggregation
export const getWardenPerformance = async (req, res) => {
    try {
        const wardens = await User.find({ role: "warden" }).lean();
        
        const performanceData = await Promise.all(wardens.map(async (warden) => {
            const block = warden.block;
            if (!block) {
                return {
                    ...warden,
                    stats: { activeComplaints: 0, resolvedComplaints: 0, activeEmergencies: 0, studentSatisfaction: 100, pendingLeaves: 0 }
                };
            }

            // Find all rooms in this block
            const rooms = await Room.find({ block }).select('number').lean();
            const roomNumbers = rooms.map(r => r.number);

            // Aggregate stats for these rooms
            const [activeComplaints, resolvedComplaints, activeEmergencies, pendingLeaves] = await Promise.all([
                Complaint.countDocuments({ room: { $in: roomNumbers }, status: { $in: ["Pending", "In Progress"] } }),
                Complaint.countDocuments({ room: { $in: roomNumbers }, status: "Resolved" }),
                Emergency.countDocuments({ room: { $in: roomNumbers }, status: "Pending" }),
                Leave.countDocuments({ room: { $in: roomNumbers }, status: "Pending" })
            ]);

            return {
                ...warden,
                stats: {
                    activeComplaints,
                    resolvedComplaints,
                    activeEmergencies,
                    pendingLeaves,
                    studentSatisfaction: 90
                }
            };
        }));

        res.json({ users: performanceData });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};