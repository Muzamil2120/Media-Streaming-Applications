const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Education', 'Entertainment', 'Music', 'Gaming', 'Sports', 'Tech', 'Vlogs', 'News', 'Other'],
    default: 'Other'
  },
  tags: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  trending: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
mediaSchema.index({ title: 'text', description: 'text', tags: 'text' });
mediaSchema.index({ uploader: 1, createdAt: -1 });
mediaSchema.index({ category: 1, createdAt: -1 });
mediaSchema.index({ views: -1 });

module.exports = mongoose.model('Media', mediaSchema);