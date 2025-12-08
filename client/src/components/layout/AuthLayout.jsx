import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import { YouTube } from '@mui/icons-material';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Box sx={{ mb: 4 }}>
            <YouTube
              sx={{
                fontSize: 48,
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              MediaStream
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to access your account
            </Typography>
          </Box>
          
          <Outlet />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;