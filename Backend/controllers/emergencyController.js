import Emergency from '../models/Emergency.js';
import User from '../models/User.js';
import { sendNotification } from "../utils/socket.js";

export const getEmergencies = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    }
    const emergencies = await Emergency.find(query)
      .populate('studentId', 'name roomNumber customId')
      .sort({ createdAt: -1 });
    res.json(emergencies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createEmergency = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!req.body.type || !req.body.description) {
        return res.status(400).json({ message: "All fields are required (Type and Description)." });
    }

    const newEmergency = new Emergency({
      studentId: req.user.id,
      studentName: student.name,
      room: student.roomNumber || 'Unknown',
      type: req.body.type,
      description: req.body.description
    });
    await newEmergency.save();

    // Notify ALL Wardens and Admins about Emergency
    const rolesToNotify = ['warden', 'admin'];
    for (const role of rolesToNotify) {
        await sendNotification({
            recipient: role,
            type: "emergency",
            title: "🚨 EMERGENCY ALERT",
            message: `${student.name} (Room ${student.roomNumber || 'Unknown'}) triggered a ${req.body.type} alert!`,
            link: ""
        });
    }

    res.status(201).json(newEmergency);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateEmergencyStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const update = { status, remarks };
    if (status === 'Resolved' || status === 'False Alarm') {
      update.resolvedAt = new Date();
    }
    const emergency = await Emergency.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(emergency);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
