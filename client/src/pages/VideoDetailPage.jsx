import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const VideoDetailPage = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Video Details
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Video player and details will go here</Typography>
      </Paper>
    </Container>
  );
};

export default VideoDetailPage;