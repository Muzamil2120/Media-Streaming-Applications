const express = require('express');
const Media = require('../models/Media');
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();



// Get all media (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const media = await Media.find({ isPublic: true })
      .populate('uploader', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Media.countDocuments({ isPublic: true });

    res.json({
      media,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's media
router.get('/my-media', auth, async (req, res) => {
  try {
    const media = await Media.find({ uploader: req.user.id })
      .populate('uploader', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ media });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single media
router.get('/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
      .populate('uploader', 'name avatar');

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Increment views
    media.views += 1;
    await media.save();

    res.json({ media });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload media
// In development you can set DEV_ALLOW_UPLOADS=true to bypass auth for easier local testing
const requireAuth = (req, res, next) => {
  if (process.env.DEV_ALLOW_UPLOADS === 'true') return next();
  return auth(req, res, next);
};

router.post('/upload', requireAuth, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, description, category, tags, isPublic } = req.body;

    const videoFile = req.files && req.files.video && req.files.video[0];
    const thumbFile = req.files && req.files.thumbnail && req.files.thumbnail[0];

    if (!videoFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const media = new Media({
      title,
      description,
      filename: videoFile.filename,
      originalName: videoFile.originalname,
      filePath: `/uploads/${videoFile.filename}`,
      fileSize: videoFile.size,
      thumbnail: thumbFile ? `/uploads/${thumbFile.filename}` : '',
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic: isPublic !== 'false',
      uploader: req.user && req.user.id ? req.user.id : null
    });

    await media.save();
    await media.populate('uploader', 'name avatar');

    res.status(201).json({ 
      message: 'Media uploaded successfully', 
      media 
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Update media
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, category, tags, isPublic } = req.body;

    const media = await Media.findOne({ 
      _id: req.params.id, 
      uploader: req.user.id 
    });

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    media.title = title;
    media.description = description;
    media.category = category;
    media.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
    media.isPublic = isPublic !== 'false';

    await media.save();
    await media.populate('uploader', 'name avatar');

    res.json({ message: 'Media updated successfully', media });
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// Delete media
router.delete('/:id', auth, async (req, res) => {
  try {
    const media = await Media.findOne({ 
      _id: req.params.id, 
      uploader: req.user.id 
    });

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Delete file from filesystem (optional)
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../uploads', media.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Media.findByIdAndDelete(req.params.id);

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// Search media
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const media = await Media.find({
      isPublic: true,
      $text: { $search: query }
    })
    .populate('uploader', 'name avatar')
    .sort({ createdAt: -1 });

    res.json({ media });
  } catch (error) {
    res.status(500).json({ message: 'Search failed' });
  }
});


// Get trending media
router.get('/trending/all', async (req, res) => {
  try {
    console.log('🔍 Fetching trending media');
    const now = new Date();

    const trendingMedia = await Media.aggregate([
      {
        $addFields: {
          commentsCount: { $size: { $ifNull: ['$comments', []] } },
          ageDays: {
            $divide: [
              { $subtract: [now, '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $addFields: {
          recencyScore: {
            $max: [0, { $subtract: [1, { $divide: ['$ageDays', 14] }] }]
          },
          trendingScore: {
            $add: [
              { $multiply: ['$views', 0.6] },
              { $multiply: ['$likes', 0.3] },
              { $multiply: ['$commentsCount', 0.2] },
              { $multiply: [{ $max: [0, { $subtract: [1, { $divide: ['$ageDays', 14] }] }] }, 100] }
            ]
          }
        }
      },
      { $sort: { trendingScore: -1, createdAt: -1 } },
      { $limit: 12 }
    ]);

    console.log(`✅ Found ${trendingMedia.length} trending items`);
    res.json(trendingMedia);
  } catch (error) {
    console.error('❌ Error fetching trending media:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get media by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const media = await Media.find({ isPublic: true, category })
      .populate('uploader', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Media.countDocuments({ isPublic: true, category });

    res.json({
      media,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch media by category' });
  }
});

// Like media
router.post('/:id/like', auth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    if (media.likedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already liked' });
    }

    media.likedBy.push(req.user.id);
    media.likes = media.likedBy.length;
    await media.save();

    res.json({ message: 'Media liked', likes: media.likes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to like media' });
  }
});

// Unlike media
router.post('/:id/unlike', auth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    media.likedBy = media.likedBy.filter(id => id.toString() !== req.user.id);
    media.likes = media.likedBy.length;
    await media.save();

    res.json({ message: 'Like removed', likes: media.likes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlike media' });
  }
});

// Get recommendations based on category and watch history
router.get('/recommendations/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    const recommendations = await Media.find({
      isPublic: true,
      category: media.category,
      _id: { $ne: req.params.id }
    })
      .populate('uploader', 'name avatar subscribers')
      .sort({ views: -1 })
      .limit(10);

    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
});

module.exports = router;