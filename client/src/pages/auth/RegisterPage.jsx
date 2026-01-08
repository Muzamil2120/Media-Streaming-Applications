import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const username = (formData.username || '').trim();
    const email = (formData.email || '').trim();
    const password = formData.password || '';
    const confirmPassword = formData.confirmPassword || '';

    if (!username || !email || !password) {
      setError('Username, email, and password are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        username,
        email,
        password
      });
      console.log('Registration successful:', response);
      setShowSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    setShowSuccess(false);
    navigate('/signin');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', px: 2 }}>
      <Card sx={{ width: 420, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>Create Account</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                inputProps={{ minLength: 3 }}
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                inputProps={{ minLength: 6 }}
                fullWidth
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                inputProps={{ minLength: 6 }}
                fullWidth
              />
              <Button type="submit" disabled={loading} fullWidth size="large">
                {loading ? 'Creating Account...' : 'Register'}
              </Button>
            </Stack>
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Already have an account? <Link to="/signin">Sign In</Link>
          </Typography>
        </CardContent>
      </Card>

      <Dialog open={showSuccess} onClose={() => setShowSuccess(false)}>
        <DialogTitle>Signup successful!</DialogTitle>
        <DialogContent>
          <Typography>Do you want to login now?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSuccess(false)} color="secondary">Stay Here</Button>
          <Button onClick={handleGoToLogin} autoFocus>Go to Login</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RegisterPage;