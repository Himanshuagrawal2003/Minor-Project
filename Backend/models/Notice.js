import mongoose from 'mongoose';

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical', 'low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  targetRoles: [{ 
    type: String, 
    enum: ['student', 'warden', 'chief-warden', 'staff', 'admin', 'all'],
    default: 'all'
  }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attachment: {
    name: String,
    url: String,
    fileType: String
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notice', NoticeSchema);
