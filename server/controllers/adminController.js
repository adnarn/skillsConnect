import User from '../models/User.js';
import Booking from '../models/Booking.js';
import KYC from '../models/KYC.js';

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingKYC = await KYC.countDocuments({ status: 'pending' });
    const verifiedWorkers = await User.countDocuments({ role: 'worker', isVerified: true });

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('client', 'name email')
      .populate('worker', 'name email');

    res.json({
      totalUsers,
      totalWorkers,
      totalClients,
      totalBookings,
      pendingBookings,
      completedBookings,
      pendingKYC,
      verifiedWorkers,
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = { role: { $ne: 'admin' } };
    if (role) filter.role = role;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot deactivate admin' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { 'client.name': { $regex: search, $options: 'i' } },
        { 'worker.name': { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('client', 'name email')
      .populate('worker', 'name email');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
