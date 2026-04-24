import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['client', 'worker', 'admin'],
    required: true
  },
  avatarColor: {
    type: String,
    default: '#1D9E75'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  // Worker-specific fields
  skills: [{
    type: String,
    trim: true
  }],
  bio: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    default: 0
  },
  priceRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  availability: {
    type: Boolean,
    default: true
  },
  // Legacy coordinates field (for backwards compatibility)
  legacyCoordinates: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, {
  timestamps: true
});

// Add 2dsphere index for geospatial queries
userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

