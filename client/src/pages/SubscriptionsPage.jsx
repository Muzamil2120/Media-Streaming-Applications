import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography, Card, CardActionArea, CardContent, CardMedia, Stack, Chip, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const SubscriptionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await userAPI.getSubscriptions(user._id || user.id);
        setVideos(res.subscriptions || []);
      } catch (err) {
        console.error('Failed to load subscriptions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, [user]);

  if (!user) return <Typography>Please sign in to view subscriptions.</Typography>;
  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>Subscriptions</Typography>
      {videos.length === 0 && <Typography color="text.secondary">No uploads from your subscriptions yet.</Typography>}
      <Grid container spacing={2}>
        {videos.map((video) => {
          const thumb = video.thumbnail
            ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${apiBase}${video.thumbnail}`)
            : undefined;
          return (
            <Grid item xs={12} sm={6} md={4} key={video._id}>
              <Card>
                <CardActionArea onClick={() => navigate(`/media/play/${video._id}`)}>
                  <CardMedia component="img" image={thumb || '/placeholder.jpg'} alt={video.title} sx={{ height: 180, objectFit: 'cover' }} />
                  <CardContent>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>{video.title}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{video.description || 'No description'}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" label={video.category || 'Other'} />
                        <Typography variant="caption" color="text.secondary">{(video.views || 0)} views</Typography>
                      </Stack>
                      {video.uploader && (
                        <Typography variant="caption" color="text.secondary">
                          By {video.uploader.name || video.uploader.username || 'Creator'}
                        </Typography>
                      )}
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

export default SubscriptionsPage;
