import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  MoreVert,
  ThumbUp,
  Visibility,
  AccessTime,
  Share,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const VideoCard = ({ video }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSave = () => {
    setSaved(!saved);
    handleMenuClose();
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views;
  };

  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Thumbnail with Duration */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={video.thumbnail || `https://picsum.photos/seed/${video.id}/320/180`}
          alt={video.title}
          sx={{ cursor: 'pointer' }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'rgba(0,0,0,0.8)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <AccessTime sx={{ fontSize: 14 }} />
          {video.duration}
        </Box>
        
        {/* Play Button Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.3)',
            opacity: 0,
            transition: 'opacity 0.3s',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <IconButton
            component={Link}
            to={`/video/${video.id}`}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s',
            }}
          >
            <PlayArrow />
          </IconButton>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Title */}
        <Typography
          variant="subtitle1"
          fontWeight="600"
          sx={{
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
            height: '2.6em',
          }}
        >
          {video.title}
        </Typography>

        {/* Channel Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar
            src={video.channelAvatar}
            sx={{ width: 32, height: 32, mr: 1 }}
          >
            {video.channelName?.charAt(0)}
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            {video.channelName}
          </Typography>
        </Box>

        {/* Stats & Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Visibility sx={{ fontSize: 16 }} />
              <Typography variant="caption">
                {formatViews(video.views)} views
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              •
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(video.uploadDate), { addSuffix: true })}
            </Typography>
          </Box>
        </Box>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {video.tags.slice(0, 2).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  bgcolor: 'primary.50',
                  color: 'primary.main',
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            ))}
            {video.tags.length > 2 && (
              <Chip
                label={`+${video.tags.length - 2}`}
                size="small"
                sx={{
                  bgcolor: 'grey.100',
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            )}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 0, borderTop: '1px solid', borderColor: 'divider' }}>
        <IconButton size="small" color="primary">
          <ThumbUp />
          <Typography variant="caption" sx={{ ml: 0.5 }}>
            {formatViews(video.likes)}
          </Typography>
        </IconButton>
        
        <IconButton size="small">
          <Share />
        </IconButton>
        
        <IconButton size="small" onClick={handleSave}>
          {saved ? <Bookmark color="primary" /> : <BookmarkBorder />}
        </IconButton>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <IconButton size="small" onClick={handleMenuOpen}>
          <MoreVert />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleMenuClose}>Add to queue</MenuItem>
          <MenuItem onClick={handleMenuClose}>Save to watch later</MenuItem>
          <MenuItem onClick={handleMenuClose}>Save to playlist</MenuItem>
          <MenuItem onClick={handleMenuClose}>Not interested</MenuItem>
          <MenuItem onClick={handleMenuClose}>Report</MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
};

export default VideoCard;