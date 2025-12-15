const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medias: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  thumbnail: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
playlistSchema.index({ creator: 1, createdAt: -1 });
playlistSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Playlist', playlistSchema);
