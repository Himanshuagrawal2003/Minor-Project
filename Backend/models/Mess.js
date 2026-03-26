import mongoose from 'mongoose';

const messSchema = new mongoose.Schema({
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

// Virtual for messId (using the name or _id slugified)
messSchema.virtual('messId').get(function() {
  return this.name.toLowerCase().replace(/\s+/g, '-');
});

messSchema.set('toJSON', { virtuals: true });
messSchema.set('toObject', { virtuals: true });

const Mess = mongoose.model('Mess', messSchema);
export default Mess;
