import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// City coordinates mapping (GeoJSON format: [longitude, latitude])
const cityCoordinates = {
  'lagos': { coordinates: [3.3792, 6.5244] },
  'katsina': { coordinates: [7.6017, 12.9908] },
  'enugu': { coordinates: [7.5464, 6.4584] },
  'kano': { coordinates: [8.5920, 12.0022] },
  'ibadan': { coordinates: [3.9470, 7.3775] },
  'kaduna': { coordinates: [7.4383, 10.5222] },
  'abuja': { coordinates: [7.3986, 9.0765] },
  'port harcourt': { coordinates: [7.0498, 4.8156] },
  'owerri': { coordinates: [7.0350, 5.4836] }
};

// Convert location string to GeoJSON format
const convertLocationToGeoJSON = (locationStr) => {
  const cityKey = locationStr.toLowerCase().trim();
  const cityData = cityCoordinates[cityKey] || { coordinates: [7.3986, 9.0765] }; // Default to Abuja
  
  return {
    address: locationStr,
    city: locationStr,
    state: locationStr,
    type: 'Point',
    coordinates: cityData.coordinates
  };
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, location, skills, bio, experience, priceRange } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userData = {
      name,
      email,
      password,
      role,
      phone,
      location: convertLocationToGeoJSON(location || 'Abuja')
    };

    if (role === 'worker') {
      userData.skills = skills || [];
      userData.bio = bio;
      userData.experience = experience || 0;
      userData.priceRange = priceRange || { min: 0, max: 0 };
      userData.availability = true;
      userData.lastSeen = new Date();
    }

    // Add legacyCoordinates for backwards compatibility
    const coords = userData.location.coordinates;
    userData.legacyCoordinates = { lat: coords[1], lng: coords[0] };

    const user = new User(userData);
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        skills: user.skills,
        bio: user.bio,
        experience: user.experience,
        priceRange: user.priceRange,
        rating: user.rating,
        reviewCount: user.reviewCount,
        completedJobs: user.completedJobs,
        availability: user.availability,
        coordinates: user.coordinates
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        skills: user.skills,
        bio: user.bio,
        experience: user.experience,
        priceRange: user.priceRange,
        rating: user.rating,
        reviewCount: user.reviewCount,
        completedJobs: user.completedJobs,
        availability: user.availability,
        coordinates: user.coordinates,
        isVerified: user.isVerified,
        avatarColor: user.avatarColor
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, avatarColor } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatarColor) user.avatarColor = avatarColor;
    if (location) {
      user.location = {
        ...user.location,
        address: location.address || user.location.address,
        city: location.city || user.location.city,
        state: location.state || user.location.state
      };
    }

    await user.save();

    const updatedUser = await User.findById(userId).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
