import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

export const getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.userId;

    // Verify user is part of this booking
    const booking = await Booking.findById(bookingId);
    if (!booking || (booking.client.toString() !== userId && booking.worker.toString() !== userId)) {
      return res.status(403).json({ message: 'Not authorized to view this chat' });
    }

    const messages = await Message.find({ booking: bookingId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    // Mark messages as read by current user
    await Message.updateMany(
      { 
        booking: bookingId, 
        sender: { $ne: userId },
        readBy: { $nin: [userId] }
      },
      { $push: { readBy: userId } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Verify user is part of this booking
    const booking = await Booking.findById(bookingId);
    if (!booking || (booking.client.toString() !== userId && booking.worker.toString() !== userId)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    const message = new Message({
      booking: bookingId,
      sender: userId,
      content: content.trim(),
      readBy: [userId]
    });

    await message.save();
    await message.populate('sender', 'name email');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const count = await Message.countDocuments({
      sender: { $ne: userId },
      readBy: { $nin: [userId] }
    });

    res.json({ totalUnread: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.userId;

    await Message.updateMany(
      { 
        booking: bookingId, 
        sender: { $ne: userId },
        readBy: { $nin: [userId] }
      },
      { $push: { readBy: userId } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
