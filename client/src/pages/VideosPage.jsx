import React from 'react';
import { Container, Typography, Box, Grid, Tabs, Tab, TextField, MenuItem, Select } from '@mui/material';
import VideoCard from '../components/media/VideoCard';

const VideosPage = ({ category = 'all' }) => {
  const videos = [
    // Add your video data here
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {category === 'all' ? 'All Videos' : category.charAt(0).toUpperCase() + category.slice(1)}
      </Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Sort by"
          defaultValue="newest"
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="newest">Newest</MenuItem>
          <MenuItem value="popular">Most Popular</MenuItem>
          <MenuItem value="views">Most Views</MenuItem>
        </TextField>
        
        <TextField
          select
          label="Category"
          defaultValue="all"
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          <MenuItem value="education">Education</MenuItem>
          <MenuItem value="entertainment">Entertainment</MenuItem>
        </TextField>
      </Box>

      {/* Videos Grid */}
      <Grid container spacing={3}>
        {videos.map((video) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
            <VideoCard video={video} />
          </Grid>
        ))}
      </Grid>

      {videos.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" color="text.secondary">
            No videos found
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default VideosPage;