const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Media = require('../models/Media');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Add to watch history
router.post('/watch-history/:mediaId', auth, async (req, res) => {
  try {
    const { mediaId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
      return res.status(400).json({ message: 'Invalid media ID format' });
    }

    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove old entry if exists, then add to front
    user.watchHistory = (user.watchHistory || []).filter((item) => item.media && item.media.toString() !== mediaId);
    user.watchHistory.unshift({ media: mediaId, watchedAt: new Date() });

    // Cap history length to 100
    if (user.watchHistory.length > 100) {
      user.watchHistory = user.watchHistory.slice(0, 100);
    }

    await user.save();
    res.json({ message: 'History updated' });
  } catch (error) {
    console.error('❌ Error updating watch history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get watch history
router.get('/watch-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({ path: 'watchHistory.media', select: '-__v' });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const history = (user.watchHistory || [])
      .filter((item) => item.media)
      .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
      .slice(0, 100);

    res.json({ history });
  } catch (error) {
    console.error('❌ Error fetching watch history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Subscribe to a user
router.post('/:id/subscribe', auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    if (req.user.id === targetId) {
      return res.status(400).json({ message: 'Cannot subscribe to yourself' });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { subscriptions: targetId }
    });

    await User.findByIdAndUpdate(targetId, {
      $addToSet: { subscribers: req.user.id }
    });

    res.json({ message: 'Subscribed' });
  } catch (error) {
    console.error('❌ Error subscribing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unsubscribe from a user
router.post('/:id/unsubscribe', auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { subscriptions: targetId }
    });

    await User.findByIdAndUpdate(targetId, {
      $pull: { subscribers: req.user.id }
    });

    res.json({ message: 'Unsubscribed' });
  } catch (error) {
    console.error('❌ Error unsubscribing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get subscription feed (uploads from subscribed users)
router.get('/:id/subscriptions', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const subscriptionIds = user.subscriptions || [];
    if (subscriptionIds.length === 0) {
      return res.json({ subscriptions: [] });
    }

    const media = await Media.find({
      uploader: { $in: subscriptionIds },
      isPublic: true
    })
      .populate('uploader', 'name avatar username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ subscriptions: media });
  } catch (error) {
    console.error('❌ Error fetching subscriptions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    console.log('🔍 Fetching user with ID:', req.params.id);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('❌ Invalid user ID format');
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User found:', user.username);
    res.json(user);
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user uploads
router.get('/:id/uploads', async (req, res) => {
  try {
    console.log('🔍 Fetching uploads for user ID:', req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('❌ Invalid user ID format');
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    const uploads = await Media.find({ uploader: req.params.id })
      .populate('uploader', 'name avatar username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Media.countDocuments({ uploader: req.params.id });
    
    console.log(`✅ Found ${uploads.length} uploads for user ${user.username}`);
    res.json({
      uploads,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('❌ Error fetching user uploads:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Watch later - add
router.post('/watch-later/:mediaId', auth, async (req, res) => {
  try {
    const { mediaId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
      return res.status(400).json({ message: 'Invalid media ID format' });
    }

    const media = await Media.findById(mediaId);
    if (!media) return res.status(404).json({ message: 'Media not found' });

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { watchLater: mediaId }
    });

    res.json({ message: 'Added to watch later' });
  } catch (error) {
    console.error('❌ Error adding to watch later:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Watch later - remove
router.delete('/watch-later/:mediaId', auth, async (req, res) => {
  try {
    const { mediaId } = req.params;
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { watchLater: mediaId }
    });
    res.json({ message: 'Removed from watch later' });
  } catch (error) {
    console.error('❌ Error removing from watch later:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Watch later - list
router.get('/watch-later', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'watchLater',
      populate: { path: 'uploader', select: 'name avatar username' }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ watchLater: user.watchLater || [] });
  } catch (error) {
    console.error('❌ Error fetching watch later:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Fetching all users');
    const users = await User.find().select('-password');
    console.log(`✅ Found ${users.length} users`);
    
    // Return array directly, not wrapped in object
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json([]); // Return empty array on error
  }
});

module.exports = router;