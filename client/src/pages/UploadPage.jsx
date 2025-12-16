import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert
} from '@mui/material';

const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_THUMB_SIZE = 5 * 1024 * 1024; // 5MB

// Helper: upload using XHR so we can report progress
function uploadWithProgress(url, formData, token, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText || '{}');
            resolve(json);
          } catch (err) {
            resolve({});
          }
        } else {
          reject(new Error(xhr.responseText || `Upload failed (${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

export default function UploadPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [thumbnail, setThumbnail] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const thumbPreviewRef = useRef(null);


  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Only redirect if not loading and not authenticated
      navigate('/signin', { state: { from: '/upload' } });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) return null;
  if (!isAuthenticated) return null;

  const handleThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Thumbnail must be an image file');
      setThumbnail(null);
      if (thumbPreviewRef.current) thumbPreviewRef.current.src = '';
      return;
    }

    if (file.size > MAX_THUMB_SIZE) {
      setError('Thumbnail must be under 5MB');
      setThumbnail(null);
      if (thumbPreviewRef.current) thumbPreviewRef.current.src = '';
      return;
    }

    setError('');
    setThumbnail(file);
    if (thumbPreviewRef.current) {
      thumbPreviewRef.current.src = URL.createObjectURL(file);
    }
  };

  const handleVideo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      setVideoFile(null);
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setError('Video must be under 500MB');
      setVideoFile(null);
      return;
    }

    setError('');
    setVideoFile(file);
  };

  const validate = () => {
    if (!title.trim()) return 'Title is required';
    if (!videoFile) return 'Video file is required';
    if (videoFile && videoFile.size > MAX_VIDEO_SIZE) return 'Video must be under 500MB';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('tags', tags);
    formData.append('privacy', privacy);
    if (thumbnail) formData.append('thumbnail', thumbnail);
    // server expects the video file under the 'video' field (upload.single('video'))
    formData.append('video', videoFile);

    setUploading(true);
    setProgress(0);

    // Use API base from services (falls back to REACT_APP_API_URL)
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const url = `${apiBase}/api/media/upload`;
    const token = localStorage.getItem('token');

    try {
      // prefer XHR to show progress
      const res = await uploadWithProgress(url, formData, token, setProgress);
      setSuccess('Upload successful');
      setTimeout(() => {
        // navigate to the uploaded video's page if API returned id
        if (res && (res.media || res.id || res._id)) {
          const id = (res.media && res.media._id) || res.id || res._id;
          navigate(`/media/play/${id}`);
        } else {
          navigate('/');
        }
      }, 800);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', p: 2 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Upload Video</Typography>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <TextField label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} inputProps={{ maxLength: 120 }} />
            <TextField label="Description" multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Category" placeholder="e.g. Music, Education" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Tags (comma separated)" placeholder="tag1, tag2" value={tags} onChange={(e) => setTags(e.target.value)} fullWidth />
              </Grid>
            </Grid>

            <TextField select label="Privacy" value={privacy} onChange={(e) => setPrivacy(e.target.value)} fullWidth>
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="unlisted">Unlisted</MenuItem>
            </TextField>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" component="label" fullWidth>
                  Choose Thumbnail (optional)
                  <input hidden type="file" accept="image/*" onChange={handleThumbnail} />
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                {thumbnail && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <img ref={thumbPreviewRef} alt="thumb preview" style={{ maxWidth: 140, borderRadius: 8 }} />
                    <Typography variant="body2">{thumbnail.name}</Typography>
                  </Box>
                )}
              </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Button variant="contained" component="label" fullWidth>
                  Choose Video File *
                  <input hidden type="file" accept="video/*" onChange={handleVideo} />
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                {videoFile && <Typography variant="body2">{videoFile.name}</Typography>}
              </Grid>
            </Grid>

            {uploading && (
              <Box>
                <Typography variant="body2" gutterBottom>Uploading {progress}%</Typography>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" disabled={uploading}>
                {uploading ? `Uploading ${progress}%` : 'Upload'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
