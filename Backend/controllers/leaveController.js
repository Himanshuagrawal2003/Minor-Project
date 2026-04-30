import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { sendNotification } from "../utils/socket.js";

export const getLeaves = async (req, res) => {
  try {
    const { role, _id } = req.user;
    let query = {};
    
    if (role === 'student') {
      query = { studentId: _id };
    } else if (role === 'warden') {
      // Potentially filter by warden's block, but for now show all for role
      query = {}; 
    }

    const leaves = await Leave.find(query)
      .populate('studentId', 'name roomNumber customId')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const { type, startDate, endDate, reason, noDuesCleared } = req.body;
    
    if (!type || !startDate || !endDate || !reason) {
        return res.status(400).json({ message: "All fields are required (Type, Dates, and Reason)." });
    }
    const leave = new Leave({
      studentId: req.user._id,
      studentName: req.user.name,
      room: req.user.roomNumber,
      type,
      startDate,
      endDate,
      reason,
      noDuesCleared
    });
    await leave.save();

    // Notify Warden about new leave request
    await sendNotification({
        recipient: "warden",
        type: "leave",
        title: "New Leave Request",
        message: `${req.user.name} has applied for a ${type} leave.`,
        link: ""
    });

    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, remarks },
      { new: true }
    );

    if (leave) {
        // Notify Student about leave status change
        await sendNotification({
            recipient: leave.studentId.toString(),
            type: "leave",
            title: "Leave Status Updated",
            message: `Your leave request from ${new Date(leave.startDate).toLocaleDateString()} has been ${status}.`,
            link: ""
        });
    }

    res.json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
