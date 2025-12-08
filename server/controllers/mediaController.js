const Media = require('../models/Media');

exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Media.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const video = await Media.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }
    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.uploadVideo = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file provided'
      });
    }
    
    const newVideo = new Media({
      title,
      description,
      videoUrl: `/uploads/${req.file.filename}`,
      uploaderName: 'Anonymous',
      views: 0
    });
    
    await newVideo.save();
    
    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: newVideo
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};