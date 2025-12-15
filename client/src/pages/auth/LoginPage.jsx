import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert } from '@mui/material';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData);
      console.log('Login successful:', response);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', px: 2 }}>
      <Card sx={{ width: 380, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>Sign In</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
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
                fullWidth
              />
              <Button type="submit" disabled={loading} fullWidth size="large">
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Stack>
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Don't have an account? <Link to="/signup">Register</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;