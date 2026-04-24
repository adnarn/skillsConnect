import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
};

export const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
