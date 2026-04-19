import mongoose from "mongoose";
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
        
        // 🚨 Basic Validation
        if (!name || !email || !contact || !role || !extra) {
            return res.status(400).json({ message: "All fields are required (Name, Email, Contact, Role, Extra)." });
        }

        if (!/^\d{10}$/.test(contact)) {
            return res.status(400).json({ message: "Contact number must be exactly 10 digits." });
        }
        
        // 🚨 Duplicate Email Check
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: `User with email ${email} already exists.` });
            }
        }

        const prefix = role === "student" ? "S" : role === "warden" ? "W" : role === "chief-warden" ? "CW" : role === "staff" ? "ST" : "U";
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const customId = `${prefix}-${randomNum}`;

        let userData = {
            name,
            customId,
            role,
            password: customId,
        };

        userData.contact = contact || "";
        userData.email = email || "";

        // role-based mapping (frontend extra field)
        if (role === "student") userData.course = extra;
        if (role === "warden") userData.buildingType = extra;
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
        const { id } = req.params;

        if (mongoose.Types.ObjectId.isValid(id)) {
            await User.findByIdAndDelete(id);
        } else {
            await User.findOneAndDelete({ customId: id });
        }

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
        const errors = [];

        for (let u of users) {
             // 🚨 Basic Validation
             if (!u.name || !u.email || !u.contact || !u.extra) {
                errors.push(`${u.name || "Unknown"} skipped: All fields (Name, Email, Contact, Extra) are required.`);
                continue;
             }

             if (!/^\d{10}$/.test(u.contact)) {
                errors.push(`${u.name} skipped: Contact number must be exactly 10 digits.`);
                continue;
             }

             // 🚨 Skip duplicates in bulk import
             if (u.email) {
                const existingUser = await User.findOne({ email: u.email });
                if (existingUser) {
                    errors.push(`${u.name} (${u.email}) - Email already exists.`);
                    continue;
                }
             }

            const prefix = role === "student" ? "S" : role === "warden" ? "W" : role === "chief-warden" ? "CW" : role === "staff" ? "ST" : "U";
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const customId = u.id || `${prefix}-${randomNum}`;

            let userData = {
                name: u.name,
                customId,
                role,
                password: customId,
            };

            userData.contact = u.contact || "";
            userData.email = u.email || "";

            if (role === "student") userData.course = u.extra;
            if (role === "warden") userData.buildingType = u.extra;
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
            errors: errors.length > 0 ? errors : undefined
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

        const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const identifierRegex = new RegExp(`^${escapeRegex(identifier)}$`, 'i');

        // Find by email or contact or customId (case-insensitive for email and customId)
        const user = await User.findOne({
            $or: [{ email: identifierRegex }, { contact: identifier }, { customId: identifierRegex }],
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
        let { roomNumber, block, messId, buildingType } = req.body;

        let user;
        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findById(id);
        } else {
            user = await User.findOne({ customId: id });
        }

        if (!user) {
            return res.status(404).json({ message: "Student not found" });
        }

        // UNCONDITIONAL SAVE: If messId is provided (even if empty), save it.
        // This ensures "What you select is what you get"
        if (messId !== undefined) {
             console.log(`Backend: Allotting Mess '${messId}' to User '${id}'`);
             user.messId = messId;
        }

        if (roomNumber) {
            let roomQuery = { number: roomNumber, block: block || "" };
            if (buildingType) roomQuery.type = buildingType;

            let room = await Room.findOne(roomQuery);
            
            if (!room) {
                const bPrefix = `B-${roomNumber}`;
                const gPrefix = `G-${roomNumber}`;
                room = await Room.findOne({ 
                    $or: [
                        { number: bPrefix, block: block || "", ...(buildingType ? { type: buildingType } : {}) },
                        { number: gPrefix, block: block || "", ...(buildingType ? { type: buildingType } : {}) }
                    ]
                });
            }

            if (room) {
                // Check occupancy
                const currentOccupancy = await User.countDocuments({ 
                    roomNumber: room.number, 
                    block: room.block, 
                    buildingType: room.type,
                    role: "student",
                    _id: { $ne: user._id } 
                });

                if (currentOccupancy >= room.capacity) {
                    const occupants = await User.find({ 
                        roomNumber: room.number, 
                        block: room.block, 
                        buildingType: room.type,
                        role: "student",
                        _id: { $ne: user._id }
                    }).select('name customId');
                    const occupantDetails = occupants.map(o => `${o.name} (${o.customId})`).join(', ');

                    await user.save();
                    return res.status(400).json({ 
                        message: `Room ${room.number} is FULL (${currentOccupancy}/${room.capacity}). Current occupants: ${occupantDetails || 'None detected'}`,
                        user 
                    });
                }
                
                user.roomNumber = room.number;
                user.block = room.block;
                user.buildingType = room.type;
                user.roomId = `${room.type}-${room.block}-${room.number}`;
            } else {
                // If room roomNumber was provided but not found, save mess anyway but alert room fail
                await user.save();
                return res.status(404).json({ 
                    message: "Mess updated, but specified room not found.",
                    user 
                });
            }
        } else if (roomNumber === "") {
            user.roomNumber = "";
            user.block = "";
            user.buildingType = "";
            user.roomId = "";
        }

        await user.save();
        res.json({ message: "Allotment updated successfully", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ GET ROOMMATES
export const getRoommates = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || (!user.roomNumber && !user.roomId)) {
            return res.json({ roommates: [] });
        }

        const roommates = await User.find({
            _id: { $ne: user._id },
            $or: [
                { roomId: user.roomId },
                { roomNumber: user.roomNumber, block: user.block, buildingType: user.buildingType }
            ]
        }).select("name contact email course department roomNumber block");

        res.json({ roommates });
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
            user.department = req.body.department || user.department;
            user.address = req.body.address || user.address;
            user.bio = req.body.bio || user.bio;

            // Only Admins or Wardens can change Room/Block/Mess assignments
            const canManageAllotment = ["admin", "warden", "chief-warden"].includes(req.user.role);
            if (canManageAllotment) {
                if (req.body.block !== undefined) user.block = req.body.block;
                if (req.body.roomNumber !== undefined) user.roomNumber = req.body.roomNumber;
                if (req.body.messId !== undefined) user.messId = req.body.messId;
            }

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
        const { ids, role } = req.body;

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: "Invalid IDs provided" });
        }

        const validObjectIds = ids.filter(id => id && mongoose.Types.ObjectId.isValid(String(id)));
        const allIds = ids.map(id => String(id));

        const query = {
            $or: [
                { _id: { $in: validObjectIds } },
                { customId: { $in: allIds } }
            ]
        };

        if (role) {
            query.role = role;
        }

        const result = await User.deleteMany(query);

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