import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import {
  SearchOff,
  VideoLibrary,
  History,
  Favorite,
  Upload,
} from '@mui/icons-material';

const EmptyState = ({ 
  type = 'default', 
  title, 
  message, 
  actionText, 
  onAction,
  icon: CustomIcon 
}) => {
  const icons = {
    search: SearchOff,
    videos: VideoLibrary,
    history: History,
    liked: Favorite,
    upload: Upload,
    default: VideoLibrary,
  };

  const Icon = CustomIcon || icons[type];
  const defaultTitles = {
    search: 'No results found',
    videos: 'No videos yet',
    history: 'No watch history',
    liked: 'No liked videos',
    upload: 'Nothing uploaded yet',
    default: 'No data available',
  };

  const defaultMessages = {
    search: 'Try different keywords or filters',
    videos: 'Upload your first video to get started',
    history: 'Your watch history will appear here',
    liked: 'Videos you like will appear here',
    upload: 'Start uploading to share your content',
    default: 'There is nothing to display here',
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        textAlign: 'center',
      }}
    >
      <Icon
        sx={{
          fontSize: 80,
          color: 'text.secondary',
          opacity: 0.5,
          mb: 2,
        }}
      />
      
      <Typography variant="h6" gutterBottom>
        {title || defaultTitles[type]}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
        {message || defaultMessages[type]}
      </Typography>
      
      {actionText && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;