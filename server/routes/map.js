import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/map/nearby - Find nearby available workers
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, skill, maxDistance = 50000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const pipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true,
          query: { role: 'worker' }
        }
      },
      {
        $match: {
          availability: true,
          ...(skill ? { skills: { $in: [new RegExp(skill, 'i')] } } : {})
        }
      },
      {
        $project: {
          password: 0
        }
      }
    ];

    const workers = await User.aggregate(pipeline);
    res.json(workers);
  } catch (error) {
    console.error('Error finding nearby workers:', error);
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/map/location - Update worker's live location
router.patch('/location', auth, async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.userId, role: 'worker' },
      {
        'location.coordinates': [parseFloat(lng), parseFloat(lat)],
        'location.type': 'Point',
        lastSeen: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.json({
      message: 'Location updated',
      location: user.location,
      lastSeen: user.lastSeen
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
