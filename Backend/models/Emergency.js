import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  room: { type: String },
  type: { 
    type: String, 
    required: true,
    enum: ['Medical', 'Security', 'Fire', 'Plumbing', 'Electrical', 'Other']
  },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved', 'False Alarm'],
    default: 'Pending' 
  },
  remarks: { type: String, default: '' },
  resolvedAt: { type: Date }
}, { timestamps: true });

const Emergency = mongoose.model('Emergency', emergencySchema);
export default Emergency;
