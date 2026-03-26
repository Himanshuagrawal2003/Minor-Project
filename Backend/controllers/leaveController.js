import Leave from '../models/Leave.js';
import User from '../models/User.js';

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
    res.json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
