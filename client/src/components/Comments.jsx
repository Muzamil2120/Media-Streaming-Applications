import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Paper,
  Stack,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Send,
  ThumbUp,
  ThumbDown,
  MoreVert,
  Reply,
  Sort,
  FilterList,
  EmojiEmotions,
  Gif,
  AttachFile,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const Comments = ({ videoId }) => {
  const [comments, setComments] = useState([
    {
      id: 1,
      user: {
        name: 'John Doe',
        avatar: '',
        isVerified: true,
      },
      text: 'This is an amazing tutorial! Learned so much about React Hooks.',
      likes: 245,
      dislikes: 2,
      replies: 12,
      timestamp: '2024-01-15T10:30:00Z',
      isLiked: false,
      isDisliked: false,
      repliesList: [
        {
          id: 11,
          user: { name: 'Jane Smith', avatar: '' },
          text: 'Totally agree! The useState explanation was perfect.',
          likes: 45,
          timestamp: '2024-01-15T11:00:00Z',
        },
      ],
    },
    // More comments...
  ]);
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [sortBy, setSortBy] = useState('top');
  const [anchorEl, setAnchorEl] = useState(null);
  const commentInputRef = useRef(null);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      user: {
        name: 'Current User',
        avatar: '',
        isVerified: false,
      },
      text: newComment,
      likes: 0,
      dislikes: 0,
      replies: 0,
      timestamp: new Date().toISOString(),
      isLiked: false,
      isDisliked: false,
      repliesList: [],
    };

    if (replyingTo) {
      // Add as reply
      setComments(comments.map(comment => 
        comment.id === replyingTo
          ? { ...comment, repliesList: [...comment.repliesList, comment], replies: comment.replies + 1 }
          : comment
      ));
      setReplyingTo(null);
    } else {
      // Add as new comment
      setComments([comment, ...comments]);
    }
    
    setNewComment('');
  };

  const handleLike = (commentId) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const wasLiked = comment.isLiked;
        const wasDisliked = comment.isDisliked;
        
        return {
          ...comment,
          likes: comment.likes + (wasLiked ? -1 : 1),
          dislikes: wasDisliked ? comment.dislikes - 1 : comment.dislikes,
          isLiked: !wasLiked,
          isDisliked: false,
        };
      }
      return comment;
    }));
  };

  const handleDislike = (commentId) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const wasDisliked = comment.isDisliked;
        const wasLiked = comment.isLiked;
        
        return {
          ...comment,
          dislikes: comment.dislikes + (wasDisliked ? -1 : 1),
          likes: wasLiked ? comment.likes - 1 : comment.likes,
          isDisliked: !wasDisliked,
          isLiked: false,
        };
      }
      return comment;
    }));
  };

  const CommentItem = ({ comment, depth = 0 }) => (
    <Box sx={{ ml: depth * 4, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar src={comment.user.avatar}>
          {comment.user.name.charAt(0)}
        </Avatar>
        
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight="600">
              {comment.user.name}
            </Typography>
            {comment.user.isVerified && (
              <Chip label="Verified" size="small" color="primary" />
            )}
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
            </Typography>
          </Box>
          
          <Typography variant="body2" paragraph>
            {comment.text}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Like">
              <IconButton size="small" onClick={() => handleLike(comment.id)}>
                <ThumbUp sx={{ 
                  fontSize: 16,
                  color: comment.isLiked ? 'primary.main' : 'inherit'
                }} />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  {comment.likes}
                </Typography>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Dislike">
              <IconButton size="small" onClick={() => handleDislike(comment.id)}>
                <ThumbDown sx={{ 
                  fontSize: 16,
                  color: comment.isDisliked ? 'error.main' : 'inherit'
                }} />
              </IconButton>
            </Tooltip>
            
            <Button
              size="small"
              startIcon={<Reply />}
              onClick={() => {
                setReplyingTo(comment.id);
                commentInputRef.current?.focus();
              }}
            >
              Reply
            </Button>
            
            <IconButton size="small">
              <MoreVert />
            </IconButton>
          </Box>
          
          {comment.replies > 0 && (
            <Button
              size="small"
              sx={{ mt: 1 }}
              onClick={() => {/* Handle view replies */}}
            >
              View {comment.replies} replies
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Replies */}
      {comment.repliesList?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
      ))}
      
      {replyingTo === comment.id && (
        <Box sx={{ ml: 6, mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Replying to {comment.user.name}
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
      {/* Comments Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="600">
          Comments <Badge badgeContent={comments.length} color="primary" sx={{ ml: 1 }} />
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<Sort />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            Sort by: {sortBy === 'top' ? 'Top comments' : 'Newest first'}
          </Button>
          
          <IconButton>
            <FilterList />
          </IconButton>
        </Stack>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => { setSortBy('top'); setAnchorEl(null); }}>
            Top comments
          </MenuItem>
          <MenuItem onClick={() => { setSortBy('newest'); setAnchorEl(null); }}>
            Newest first
          </MenuItem>
        </Menu>
      </Box>

      {/* Add Comment */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Avatar sx={{ width: 40, height: 40 }}>
          U
        </Avatar>
        
        <Box sx={{ flexGrow: 1 }}>
          <form onSubmit={handleSubmitComment}>
            <TextField
              fullWidth
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              inputRef={commentInputRef}
              multiline
              maxRows={4}
              sx={{ mb: 1 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={1}>
                <IconButton size="small">
                  <EmojiEmotions />
                </IconButton>
                <IconButton size="small">
                  <Gif />
                </IconButton>
                <IconButton size="small">
                  <AttachFile />
                </IconButton>
              </Stack>
              
              <Button
                type="submit"
                variant="contained"
                startIcon={<Send />}
                disabled={!newComment.trim()}
              >
                Comment
              </Button>
            </Box>
          </form>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Comments List */}
      <Box>
        {comments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No comments yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to comment!
            </Typography>
          </Box>
        ) : (
          comments.map((comment) => (
            <React.Fragment key={comment.id}>
              <CommentItem comment={comment} />
              <Divider sx={{ my: 2 }} />
            </React.Fragment>
          ))
        )}
      </Box>
    </Paper>
  );
};

export default Comments;