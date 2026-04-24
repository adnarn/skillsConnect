import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema({
  worker: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  fullName: { type: String, required: true },
  idType: { 
    type: String, 
    enum: ['NIN', 'drivers_license', 'voters_card', 'passport'], 
    required: true 
  },
  idNumber: { type: String, required: true },
  idPhotoUrl: { type: String, required: true },
  selfieUrl: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  rejectionReason: { type: String, default: '' },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reviewedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('KYC', kycSchema);
