// server/routes/mediaRoutes.js
const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { uploadVideo } = require('../middleware/uploadMiddleware');

// Simple auth middleware (temporary)
const protect = (req, res, next) => {
  // For development, allow all requests
  // In production, implement proper JWT verification
  req.user = { _id: 'dev-user-id' };
  next();
};

// Public routes
router.get('/', mediaController.getAllVideos);
router.get('/:id', mediaController.getVideoById);

// Protected routes
router.post('/upload', protect, uploadVideo, mediaController.uploadVideo);

// Update video
router.put('/:id', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Update endpoint - implement logic'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete video
router.delete('/:id', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Delete endpoint - implement logic'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;