import mongoose from 'mongoose';

const messSchema = new mongoose.Schema({
  messId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    default: 200
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Mess = mongoose.model('Mess', messSchema);
export default Mess;
