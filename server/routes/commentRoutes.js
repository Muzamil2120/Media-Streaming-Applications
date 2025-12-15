const express = require('express');
const Comment = require('../models/Comment');
const Media = require('../models/Media');
const auth = require('../middleware/auth');
const router = express.Router();

// Get comments for a media
router.get('/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ media: mediaId })
      .populate('author', 'name avatar')
      .populate('replies.author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ media: mediaId });

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// Create a comment
router.post('/:mediaId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const { mediaId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    const comment = new Comment({
      text: text.trim(),
      author: req.user.id,
      media: mediaId
    });

    await comment.save();
    await comment.populate('author', 'name avatar');

    // Add comment to media
    media.comments.push(comment._id);
    await media.save();

    res.status(201).json({ message: 'Comment created', comment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create comment' });
  }
});

// Update comment
router.put('/:commentId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      author: req.user.id
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.text = text.trim();
    await comment.save();
    await comment.populate('author', 'name avatar');

    res.json({ message: 'Comment updated', comment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update comment' });
  }
});

// Delete comment
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      author: req.user.id
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Remove from media
    await Media.findByIdAndUpdate(comment.media, {
      $pull: { comments: commentId }
    });

    await Comment.findByIdAndDelete(commentId);

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

// Like a comment
router.post('/:commentId/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.likedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already liked' });
    }

    comment.likedBy.push(req.user.id);
    comment.likes = comment.likedBy.length;
    await comment.save();

    res.json({ message: 'Comment liked', likes: comment.likes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to like comment' });
  }
});

// Unlike a comment
router.post('/:commentId/unlike', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.likedBy = comment.likedBy.filter(id => id.toString() !== req.user.id);
    comment.likes = comment.likedBy.length;
    await comment.save();

    res.json({ message: 'Like removed', likes: comment.likes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlike comment' });
  }
});

// Add reply to comment
router.post('/:commentId/reply', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const { commentId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Reply cannot be empty' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.replies.push({
      text: text.trim(),
      author: req.user.id
    });

    await comment.save();
    await comment.populate('replies.author', 'name avatar');

    res.json({ message: 'Reply added', comment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add reply' });
  }
});

module.exports = router;
