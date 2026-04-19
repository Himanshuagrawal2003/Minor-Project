import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true }, // Denormalized for quick access
  room: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Weekend Pass', 'Medical Leave', 'Semester Leave', 'Permanent Checkout'],
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  noDuesCleared: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  remarks: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Leave', LeaveSchema);
