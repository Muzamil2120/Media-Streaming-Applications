import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert, FormControlLabel, Checkbox } from '@mui/material';

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: '', bio: '', avatar: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || user.username || '', bio: user.bio || '', avatar: user.avatar || '' });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);
  
  // include isPrivate in form if available
  useEffect(() => {
    if (user && typeof user.isPrivate !== 'undefined') setForm(f => ({ ...f, isPrivate: !!user.isPrivate }));
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Guard: reject oversized data URL avatar before sending
    if (form.avatar && form.avatar.startsWith('data:')) {
      const approxBytes = (form.avatar.length * 3) / 4; // rough base64 -> bytes
      if (approxBytes > 2.5 * 1024 * 1024) {
        setLoading(false);
        setError('Avatar is too large. Please use an image under ~2.5MB or provide a URL.');
        return;
      }
    }
    try {
      const payload = { name: form.name, bio: form.bio, avatar: form.avatar, isPrivate: !!form.isPrivate };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const updated = await authAPI.updateProfile(payload);
      // updateAuth context if available
      if (updateProfile) updateProfile({ name: form.name, bio: form.bio, avatar: form.avatar });
      setMessage('Profile updated');
      setTimeout(() => navigate(`/profile/${updated.user ? updated.user.id || updated.user._id : ''}` || '/'), 600);
    } catch (err) {
      setError(err.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Avatar must be an image');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Avatar must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === 'string') {
        setForm((f) => ({ ...f, avatar: dataUrl }));
        setAvatarPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: 2 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Profile Settings</Typography>
      <Card>
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}

            <TextField label="Display Name" name="name" value={form.name} onChange={handleChange} required />
            <TextField label="Bio" name="bio" value={form.bio} onChange={handleChange} multiline minRows={3} />
            <TextField label="Avatar URL" name="avatar" value={form.avatar} onChange={handleChange} placeholder="https://..." />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Button variant="outlined" component="label">
                Upload avatar
                <input hidden type="file" accept="image/*" onChange={handleAvatarFile} />
              </Button>
              {avatarPreview && (
                <img src={avatarPreview} alt="avatar preview" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
              )}
            </Stack>

            <FormControlLabel
              control={<Checkbox checked={!!form.isPrivate} onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })} />}
              label="Make profile private (hide email and private info from others)"
            />

            <DividerText text="Change password (optional)" />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
              />
              <TextField
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
              />
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function DividerText({ text }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: 13 }}>
      <Box sx={{ flex: 1, height: 1, backgroundColor: '#e0e0e0' }} />
      <span>{text}</span>
      <Box sx={{ flex: 1, height: 1, backgroundColor: '#e0e0e0' }} />
    </Box>
  );
}
