import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Avatar } from '@mui/material';
import { PlayArrow, AccessTime } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const VideoCard = ({ video }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={video.thumbnail}
          alt={video.title}
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
      </Box>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
          {video.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
            {video.channelName?.charAt(0)}
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            {video.channelName}
          </Typography>
        </Box>
        
        <Typography variant="caption" color="text.secondary">
          {video.views} views • {video.uploadDate}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default VideoCard;