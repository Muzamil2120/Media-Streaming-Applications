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
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    const { title, description, category, tags, isPublic } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const media = new Media({
      title,
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic: isPublic !== 'false',
      uploader: req.user.id
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

module.exports = router;