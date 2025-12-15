const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Index for efficient querying
commentSchema.index({ media: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
