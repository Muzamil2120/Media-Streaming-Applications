import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff, YouTube } from '@mui/icons-material';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just redirect to login
    navigate('/login');
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <YouTube
          sx={{
            fontSize: 48,
            color: 'primary.main',
            mb: 2,
          }}
        />
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Create your account
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          margin="normal"
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          margin="normal"
          required
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 2, py: 1.5 }}
        >
          Create Account
        </Button>

        <Typography sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Already have an account?{' '}
          <Typography
            component={Link}
            to="/login"
            sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}
          >
            Sign in
          </Typography>
        </Typography>
      </form>
    </Box>
  );
};

export default RegisterPage;