import User from '../models/User.js';

export const getWorkers = async (req, res) => {
  try {
    const { skill, location, minRating } = req.query;
    
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
