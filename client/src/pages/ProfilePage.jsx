import React from 'react';
import { Container, Typography, Box, Avatar, Paper, Button } from '@mui/material';
import { Edit, VideoCall } from '@mui/icons-material';

const ProfilePage = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 100, height: 100, mr: 3 }} />
          <Box>
            <Typography variant="h4">John Doe</Typography>
            <Typography color="text.secondary">@johndoe</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="contained" startIcon={<Edit />}>
                Edit Profile
              </Button>
              <Button variant="outlined" startIcon={<VideoCall />}>
                My Videos
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;