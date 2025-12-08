import React from 'react';
import { Container, Typography, Box, Button, Grid } from '@mui/material';
import { PlayArrow, TrendingUp } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import VideoCard from '../components/media/VideoCard';

const HomePage = () => {
  const featuredVideos = [
    {
      id: 1,
      title: 'Introduction to MERN Stack',
      description: 'Learn MERN stack development from scratch',
      thumbnail: 'https://picsum.photos/seed/video1/320/180',
      duration: '15:30',
      views: 1500,
      likes: 120,
      channelName: 'John Doe',
      channelAvatar: '',
      uploadDate: '2025-01-15',
      tags: ['MERN', 'React', 'Node.js'],
    },
    // Add more videos as needed
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '300px', md: '400px' },
          borderRadius: 3,
          overflow: 'hidden',
          mb: 6,
          background: 'linear-gradient(135deg, #FF0000 0%, #FF5252 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          p: 4,
        }}
      >
        <Box sx={{ zIndex: 1, maxWidth: 800 }}>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Welcome to MediaStream
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Stream, Share, and Discover Amazing Videos
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/upload"
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              sx={{
                bgcolor: 'white',
                color: '#FF0000',
                '&:hover': { bgcolor: '#f5f5f5' },
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 'bold',
              }}
            >
              Upload Video
            </Button>
            <Button
              component={Link}
              to="/videos"
              variant="outlined"
              size="large"
              startIcon={<TrendingUp />}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: '#f5f5f5', bgcolor: 'rgba(255,255,255,0.1)' },
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 'bold',
              }}
            >
              Browse Videos
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Featured Videos */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Featured Videos
        </Typography>
        <Grid container spacing={3}>
          {featuredVideos.map((video) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
              <VideoCard video={video} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;