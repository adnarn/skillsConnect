import User from '../models/User.js';

export const getWorkers = async (req, res) => {
  try {
    const { skill, location, minRating, verified } = req.query;
    
    let query = { role: 'worker' };
    
    if (skill) {
      query.skills = { $in: [new RegExp(skill, 'i')] };
    }
    
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (verified === 'true') {
      query.isVerified = true;
    }

    const workers = await User.find(query).select('-password');
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkerById = async (req, res) => {
  try {
    const worker = await User.findOne({ _id: req.params.id, role: 'worker' }).select('-password');
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkerProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.role;
    delete updates.email;

    const worker = await User.findOneAndUpdate(
      { _id: req.userId, role: 'worker' },
      updates,
      { new: true }
    ).select('-password');

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const worker = await User.findOneAndUpdate(
      { _id: req.userId, role: 'worker' },
      { availability },
      { new: true }
    ).select('-password');

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVisibility = async (req, res) => {
  try {
    const { isVisible } = req.body;

    const worker = await User.findOneAndUpdate(
      { _id: req.userId, role: 'worker' },
      { isVisible },
      { new: true }
    ).select('-password');

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const worker = await User.findOne({ _id: req.userId, role: 'worker' });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    if (!worker.isVisible) {
      return res.status(400).json({ message: 'Worker is not visible' });
    }

    worker.location.coordinates = [lng, lat];
    worker.lastLocationUpdate = new Date();
    worker.legacyCoordinates = { lat, lng };
    await worker.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVisibleWorkers = async (req, res) => {
  try {
    console.log('Fetching visible workers...');
    const workers = await User.find({
      role: 'worker',
      isVisible: true,
      availability: true
    }).select('-password');

    console.log(`Found ${workers.length} visible workers`);
    res.json(workers);
  } catch (error) {
    console.error('Error fetching visible workers:', error);
    res.status(500).json({ message: error.message });
  }
};
