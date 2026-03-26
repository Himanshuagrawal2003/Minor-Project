import mongoose from 'mongoose';

const MessMenuSchema = new mongoose.Schema({
  messId: { 
    type: String, 
    required: true,
    default: 'Default Mess'
  },
  day: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true 
  },
  meals: {
    breakfast: [String],
    lunch: [String],
    dinner: [String]
  },
  updatedAt: { type: Date, default: Date.now }
});

// Compound unique index for messId and day
MessMenuSchema.index({ messId: 1, day: 1 }, { unique: true });

export default mongoose.model('MessMenu', MessMenuSchema);
