import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  price: {
    type: Number
  },
  address: {
    type: String,
    required: true
  },
  clientLocation: {
    address: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Booking', bookingSchema);
