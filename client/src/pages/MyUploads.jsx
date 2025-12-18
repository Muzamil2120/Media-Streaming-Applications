import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mediaAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Stack,
  Typography,
  Button,
  Alert
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5002';

export default function MyUploads() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const openPlayerInNewTab = (id) => {
    window.open(`/media/play/${id}`, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate('/signin', { state: { from: '/my-uploads' } });
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await mediaAPI.getMyMedia();
        setVideos(res.media || []);
      } catch (err) {
        setError(err.message || 'Failed to load your uploads');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [isAuthenticated, loading, navigate]);

  if (loading) return null;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>My Uploaded Videos</Typography>
        <Button variant="contained" onClick={() => navigate('/upload')}>Upload new</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <LoadingSpinner />
        </Box>
      ) : videos.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Typography variant="h6" gutterBottom>No uploads yet</Typography>
          <Typography variant="body2" gutterBottom>Upload your first video to see it here.</Typography>
          <Button variant="contained" onClick={() => navigate('/upload')}>Upload a video</Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
          {videos.map((video) => {
            const duration = video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '0:00';
            const thumb = video.thumbnail
              ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${apiBase}${video.thumbnail}`)
              : null;
            const source = video.filePath
              ? (video.filePath.startsWith('http') ? video.filePath : `${apiBase}${video.filePath}`)
              : undefined;
            return (
              <Card key={video._id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea onClick={() => openPlayerInNewTab(video._id)}>
                  <CardMedia
                    component="img"
                    image={thumb || '/placeholder.jpg'}
                    title={video.title}
                    sx={{ height: 190, backgroundColor: '#000', objectFit: 'cover' }}
                  />
                </CardActionArea>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>{video.title}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{video.description || 'No description'}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={video.category || 'Other'} />
                      <Typography variant="caption" color="text.secondary">{duration}</Typography>
                      <Typography variant="caption" color="text.secondary">{(video.views || 0)} views</Typography>
                      {video.createdAt && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(video.createdAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
                <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }}>
                  <Button startIcon={<PlayArrowIcon />} variant="outlined" onClick={() => openPlayerInNewTab(video._id)}>
                    Play
                  </Button>
                  <IconButton aria-label="edit" onClick={() => navigate(`/media/edit/${video._id}`)}>
                    <EditIcon />
                  </IconButton>
                </Stack>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
