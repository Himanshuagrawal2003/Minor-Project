import Emergency from '../models/Emergency.js';
import User from '../models/User.js';

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
    const newEmergency = new Emergency({
      studentId: req.user.id,
      studentName: student.name,
      room: student.roomNumber || 'Unknown',
      type: req.body.type,
      description: req.body.description
    });
    await newEmergency.save();
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
