import Complaint from "../models/Complaint.js";
import Notice from "../models/Notice.js";
import Leave from "../models/Leave.js";
import MessMenu from "../models/MessMenu.js";
import User from "../models/User.js";
import Room from "../models/Room.js";

export const getDashboard = async (req, res) => {
    try {
        const { role, _id } = req.user;
        console.log(`[Dashboard] User: ${_id}, Role: ${role}`);

        // Common stats for Admin/Warden
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalWardens = await User.countDocuments({ role: "warden" });
        const totalRooms = await Room.countDocuments({});
        const pendingComplaints = await Complaint.countDocuments({ status: "Pending" });
        const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
        const activeIssues = await Complaint.countDocuments({ status: { $in: ["Pending", "In Progress"] } });

        const recentComplaints = await Complaint.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // 7-day chart data logic
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const complaintsByDayRaw = await Complaint.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%a", date: "$createdAt" } },
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

        // Role specific data (e.g. for student)
        let studentStats = {};
        if (role === "student") {
            const myActive = await Complaint.countDocuments({ 
                studentId: req.user._id, 
                status: { $in: ["Pending", "In Progress"] } 
            });
            const myResolved = await Complaint.countDocuments({ 
                studentId: req.user._id, 
                status: "Resolved" 
            });

            console.log(`Dashboard Stats for ${req.user.name}: Active=${myActive}, Resolved=${myResolved}, Room=${req.user.roomNumber}`);

            const myLeaves = await Leave.countDocuments({ studentId: req.user._id });
            
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const today = days[new Date().getDay()];
            const todayMenu = await MessMenu.findOne({ day: today });

            const roommates = await User.find({
                roomNumber: req.user.roomNumber,
                block: req.user.block,
                _id: { $ne: req.user._id },
                role: "student"
            }).select("name contact customId").lean();

            studentStats = { 
                myActive, 
                myResolved,
                myLeaves,
                todayMenu: todayMenu?.meals || null,
                roomNumber: req.user.roomNumber || "Pending",
                block: req.user.block || "",
                messId: req.user.messId || "",
                roommates: roommates || []
            };
        }

        res.json({
            totalStudents,
            totalWardens,
            totalRooms,
            pendingComplaints,
            pendingLeaves,
            activeIssues,
            recentComplaints: recentComplaints.map(c => ({
                id: c._id.toString().substring(c._id.toString().length - 6),
                student: c.studentName || "Anonymous",
                category: c.category,
                status: c.status,
                date: new Date(c.createdAt).toLocaleDateString()
            })),
            chartData,
            studentStats
        });

    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).json({ message: err.message });
    }
};