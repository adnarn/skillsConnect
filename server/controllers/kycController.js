import KYC from '../models/KYC.js';
import User from '../models/User.js';

export const submitKYC = async (req, res) => {
  try {
    const { fullName, idType, idNumber, address, phone } = req.body;
    const userId = req.userId;

    // Check if user is a worker
    const user = await User.findById(userId);
    if (!user || user.role !== 'worker') {
      return res.status(403).json({ message: 'Only workers can submit KYC' });
    }

    // Check if KYC already exists
    const existingKYC = await KYC.findOne({ worker: userId });
    if (existingKYC) {
      return res.status(400).json({ message: 'KYC already submitted' });
    }

    const kyc = new KYC({
      worker: userId,
      fullName,
      idType,
      idNumber,
      idPhotoUrl: req.files['idPhoto']?.[0]?.path,
      selfieUrl: req.files['selfie']?.[0]?.path,
      address,
      phone
    });

    await kyc.save();

    res.status(201).json(kyc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyKYCStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const kyc = await KYC.findOne({ worker: userId });
    res.json(kyc || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllKYC = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const kycs = await KYC.find(filter)
      .populate('worker', 'name email skills location')
      .sort({ createdAt: -1 });
    
    res.json(kycs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const adminId = req.userId;

    const kyc = await KYC.findById(id);
    if (!kyc) {
      return res.status(404).json({ message: 'KYC not found' });
    }

    kyc.status = status;
    kyc.rejectionReason = rejectionReason || '';
    kyc.reviewedBy = adminId;
    kyc.reviewedAt = new Date();

    await kyc.save();

    // Update worker's isVerified status
    const worker = await User.findById(kyc.worker);
    if (worker) {
      worker.isVerified = status === 'approved';
      await worker.save();
    }

    res.json(kyc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
