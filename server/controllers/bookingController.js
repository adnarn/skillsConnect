import Booking from '../models/Booking.js';
import User from '../models/User.js';

export const createBooking = async (req, res) => {
  try {
    const { workerId, service, description, date, price, address, clientLocation } = req.body;

    const worker = await User.findOne({ _id: workerId, role: 'worker' });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const booking = new Booking({
      client: req.userId,
      worker: workerId,
      service,
      description,
      date: new Date(date),
      price,
      address,
      clientLocation
    });

    await booking.save();
    await booking.populate('client worker', '-password');

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClientBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ client: req.userId })
      .populate('worker', '-password')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ worker: req.userId })
      .populate('client', '-password')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify the user is either the client or worker for this booking
    if (booking.client.toString() !== req.userId && booking.worker.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();
    await booking.populate('client worker', '-password');

    // If status is completed, increment worker's completedJobs
    if (status === 'completed') {
      await User.findByIdAndUpdate(booking.worker, {
        $inc: { completedJobs: 1 }
      });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('client worker', '-password');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.client._id.toString() !== req.userId && booking.worker._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
