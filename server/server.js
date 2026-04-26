import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

import authRoutes from './routes/auth.js';
import workerRoutes from './routes/workers.js';
import bookingRoutes from './routes/bookings.js';
import mapRoutes from './routes/map.js';
import kycRoutes from './routes/kyc.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000', 'https://skills-connect-flhj.vercel.app', 'https://skill-connects.vercel.app'],
    credentials: true
  }
});

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000', 'https://skills-connect-flhj.vercel.app', 'https://skill-connects.vercel.app'],
  credentials: true
}));

app.use(express.json());

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SkillConnect API is running' });
});

// Debug endpoint - list users (remove in production)
import User from './models/User.js';
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}).select('name email role location -_id');
    res.json({
      database: mongoose.connection.db.databaseName,
      userCount: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug login test endpoint
app.post('/api/debug/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.json({ exists: false, message: 'User not found' });
    }
    
    const isMatch = await user.comparePassword(password);
    res.json({
      exists: true,
      passwordMatch: isMatch,
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dexCoder:dexcoder@crudeapi.x0tnkno.mongodb.net/skillconnect';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a booking room
  socket.on('join-booking', (bookingId) => {
    socket.join(`booking-${bookingId}`);
    console.log(`User ${socket.id} joined booking-${bookingId}`);
  });

  // Leave a booking room
  socket.on('leave-booking', (bookingId) => {
    socket.leave(`booking-${bookingId}`);
    console.log(`User ${socket.id} left booking-${bookingId}`);
  });

  // Send message event
  socket.on('send-message', (data) => {
    const { bookingId, message } = data;
    io.to(`booking-${bookingId}`).emit('new-message', message);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { bookingId, userId } = data;
    socket.to(`booking-${bookingId}`).emit('user-typing', { userId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

export { io };
