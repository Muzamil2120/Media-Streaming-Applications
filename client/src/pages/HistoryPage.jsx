import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import { Box, Card, CardActionArea, CardContent, CardMedia, Stack, Typography } from '@mui/material';
import { userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const res = await userAPI.getWatchHistory();
        const list = res.history || [];
        setItems(list);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>Watch History</Typography>
      {items.length === 0 && <Typography color="text.secondary">No history yet.</Typography>}
      <Grid container spacing={2}>
        {items.map((entry) => {
          const video = entry.media;
          if (!video) return null;
          const thumb = video.thumbnail
            ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${apiBase}${video.thumbnail}`)
            : undefined;
          return (
            <Grid key={video._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardActionArea onClick={() => navigate(`/media/play/${video._id}`)}>
                  <CardMedia component="img" image={thumb || '/placeholder.svg'} alt={video.title} sx={{ height: 160, objectFit: 'cover' }} />
                  <CardContent>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>{video.title}</Typography>
                      <Typography variant="caption" color="text.secondary">Watched on {new Date(entry.watchedAt).toLocaleString()}</Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default HistoryPage;
