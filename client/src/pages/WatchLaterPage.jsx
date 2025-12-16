import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Grid, Stack, Typography } from '@mui/material';
import { userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const WatchLaterPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await userAPI.getWatchLater();
      setItems(res.watchLater || []);
    } catch (err) {
      console.error('Failed to load watch later', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (id) => {
    try {
      await userAPI.removeFromWatchLater(id);
      await load();
    } catch (err) {
      console.error('Failed to remove', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>Watch Later</Typography>
      {items.length === 0 && <Typography color="text.secondary">No videos saved for later.</Typography>}
      <Grid container spacing={2}>
        {items.map((video) => {
          const thumb = video.thumbnail
            ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${apiBase}${video.thumbnail}`)
            : undefined;
          return (
            <Grid item xs={12} sm={6} md={4} key={video._id}>
              <Card>
                <CardActionArea onClick={() => navigate(`/media/play/${video._id}`)}>
                  <CardMedia component="img" image={thumb || '/placeholder.jpg'} alt={video.title} sx={{ height: 160, objectFit: 'cover' }} />
                  <CardContent>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>{video.title}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{video.description || 'No description'}</Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
                <Button onClick={() => handleRemove(video._id)} sx={{ m: 1 }} color="secondary" variant="outlined">
                  Remove
                </Button>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default WatchLaterPage;
