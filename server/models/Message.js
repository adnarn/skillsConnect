import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  booking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  readBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, { timestamps: true });

// Index for efficient queries
messageSchema.index({ booking: 1, createdAt: 1 });
messageSchema.index({ sender: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);
