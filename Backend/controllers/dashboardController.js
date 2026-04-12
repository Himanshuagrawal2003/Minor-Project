import Complaint from "../models/Complaint.js";
import Notice from "../models/Notice.js";
import Leave from "../models/Leave.js";
import MessMenu from "../models/MessMenu.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import Emergency from "../models/Emergency.js";

export const getDashboard = async (req, res) => {
    try {
        const { role, _id, block, messId } = req.user;
        console.log(`[Dashboard] User: ${_id}, Role: ${role}`);

        // --- GLOBAL STATS (Admin focus) ---
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalWardens = await User.countDocuments({ role: "warden" });
        const totalRooms = await Room.countDocuments({});
        const totalPendingComplaints = await Complaint.countDocuments({ status: "Pending" });
        const totalEscalatedComplaints = await Complaint.countDocuments({ status: "Escalated" });
        const totalPendingLeaves = await Leave.countDocuments({ status: "Pending" });
        const totalActiveEmergencies = await Emergency.countDocuments({ status: { $nin: ["Resolved", "False Alarm"] } });

        // --- RECENT COMPLAINTS ---
        const recentComplaintsRaw = await Complaint.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // --- CHART DATA (Last 7 Days) ---
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const complaintsByDayRaw = await Complaint.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } },
                    count: { $sum: 1 },
                    date: { $first: "$createdAt" }
                }
            },
            { $sort: { date: 1 } }
        ]);

        const chartData = complaintsByDayRaw.map(item => ({
            name: item._id,
            problems: item.count
        }));

        // --- ROLE-SPECIFIC STATS ---
        let studentStats = {};
        let wardenStats = {};
        let staffStats = {};

        if (role === "student") {
            const myActive = await Complaint.countDocuments({
                studentId: _id,
                status: { $in: ["Pending", "In Progress"] }
            });
            const myResolved = await Complaint.countDocuments({
                studentId: _id,
                status: "Resolved"
            });
            const myLeaves = await Leave.countDocuments({ studentId: _id });

            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const today = days[new Date().getDay()];
            const dayRegex = new RegExp(`^${today}$`, 'i');

            // Try to find menu for specific mess
            let todayMenu = null;
            const currentMessId = req.user.messId;
            
            if (currentMessId) {
                // Robust matching: case-insensitive, ignores dash/space differences
                const messRegex = new RegExp(`^${currentMessId.trim().replace(/-/g, '[- ]')}$`, 'i');
                todayMenu = await MessMenu.findOne({ day: dayRegex, messId: messRegex });
            }

            // Fallback 1: Try Default Mess
            if (!todayMenu) {
                todayMenu = await MessMenu.findOne({ day: dayRegex, messId: /Default Mess/i });
            }

            // Fallback 2: Any menu available for today (since user says it is "decided")
            if (!todayMenu) {
                todayMenu = await MessMenu.findOne({ day: dayRegex });
            }

            const roommates = await User.find({
                roomNumber: req.user.roomNumber,
                block: req.user.block,
                _id: { $ne: _id },
                role: "student"
            }).select("name contact customId").lean();

            let buildingType = req.user.buildingType;
            let roomId = req.user.roomId;

            if ((!buildingType || !roomId) && req.user.roomNumber) {
                const room = await Room.findOne({ number: req.user.roomNumber, block: req.user.block });
                if (room) {
                    buildingType = room.type;
                    roomId = `${room.type}-${room.block}-${room.number}`;
                    await User.findByIdAndUpdate(_id, { buildingType, roomId });
                }
            }

            const contacts = await User.find({
                role: { $in: ["warden", "chief-warden"] }
            }).select("name contact role buildingType").lean();

            studentStats = {
                myActive,
                myResolved,
                myLeaves,
                todayMenu: todayMenu || null,
                roomNumber: req.user.roomNumber || "Pending",
                block: req.user.block || "",
                buildingType: buildingType || "",
                roomId: roomId || "",
                messId: req.user.messId || "",
                roommates: roommates || [],
                contacts: contacts || []
            };
        }

        if (role === "warden" || role === "chief-warden") {
            const blockFilter = block ? { block } : {};
            const blockRooms = await Room.find(blockFilter).select("number").lean();
            const roomNumbers = blockRooms.map(r => r.number);

            const blockPendingComplaints = await Complaint.countDocuments({
                room: { $in: roomNumbers },
                status: "Pending"
            });
            const blockPendingLeaves = await Leave.countDocuments({
                room: { $in: roomNumbers },
                status: "Pending"
            });
            const blockStudents = await User.countDocuments({
                ...blockFilter,
                role: "student"
            });

            wardenStats = {
                blockStudents,
                pendingComplaints: blockPendingComplaints,
                pendingLeaves: blockPendingLeaves,
                blockName: block || "All Blocks"
            };
        }

        if (role === "staff") {
            // Staff specifically handles complaints (tasks)
            const myAssigned = await Complaint.countDocuments({ status: { $in: ["Pending", "In Progress"] } });
            const myResolved = await Complaint.countDocuments({ status: "Resolved" });

            staffStats = {
                myAssigned,
                myResolved
            };
        }

        // --- FETCH ESCALATIONS FOR SUPERVISORS ---
        let escalatedComplaints = [];
        if (role === "chief-warden" || role === "admin") {
            escalatedComplaints = await Complaint.find({ status: "Escalated" })
                .sort({ updatedAt: -1 })
                .limit(5)
                .lean();
        }

        res.json({
            totalStudents,
            totalWardens,
            totalRooms,
            pendingComplaints: role === "warden" ? wardenStats.pendingComplaints : totalPendingComplaints,
            escalatedComplaintsCount: totalEscalatedComplaints,
            pendingLeaves: role === "warden" ? wardenStats.pendingLeaves : totalPendingLeaves,
            activeEmergenciesCount: totalActiveEmergencies,
            activeIssues: totalPendingComplaints + totalPendingLeaves + totalEscalatedComplaints + totalActiveEmergencies,
            recentComplaints: recentComplaintsRaw.map(c => ({
                id: c._id.toString().substring(c._id.toString().length - 6),
                student: c.studentName || "Anonymous",
                category: c.category,
                status: c.status,
                date: new Date(c.createdAt).toLocaleDateString()
            })),
            escalatedComplaints: escalatedComplaints.map(c => ({
                id: c._id.toString().substring(c._id.toString().length - 6),
                student: c.studentName || "Anonymous",
                category: c.category,
                status: c.status,
                date: new Date(c.updatedAt).toLocaleDateString(),
                fullId: c._id
            })),
            chartData,
            studentStats,
            wardenStats,
            staffStats
        });

    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).json({ message: err.message });
    }
};