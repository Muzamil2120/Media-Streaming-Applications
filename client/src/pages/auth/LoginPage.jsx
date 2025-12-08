import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff, YouTube } from '@mui/icons-material';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just redirect to home
    navigate('/');
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
          Sign in to MediaStream
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
          label="Email or Username"
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
          <FormControlLabel
            control={<Checkbox />}
            label="Remember me"
          />
          <Typography
            component={Link}
            to="/forgot-password"
            sx={{ textDecoration: 'none', color: 'primary.main' }}
          >
            Forgot password?
          </Typography>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 2, py: 1.5 }}
        >
          Sign In
        </Button>

        <Typography sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Don't have an account?{' '}
          <Typography
            component={Link}
            to="/register"
            sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}
          >
            Sign up
          </Typography>
        </Typography>
      </form>
    </Box>
  );
};

export default LoginPage;