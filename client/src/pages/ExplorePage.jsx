import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardActionArea, CardContent, CardMedia, Chip, Grid, Stack, Tab, Tabs, Typography } from '@mui/material';
import { mediaAPI, dailymotionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5002';
const categories = ['All', 'Music', 'Education', 'Gaming', 'Sports', 'Tech', 'News', 'Entertainment', 'Vlogs', 'Other', 'Dailymotion'];

const ExplorePage = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState('All');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (category) => {
    try {
      setLoading(true);
      setError('');
      if (category === 'Dailymotion') {
        const list = await dailymotionAPI.getTrending(1, 24);
        const mapped = list.map((v) => ({
          _id: `dm_${v.id}`,
          dmId: v.id,
          title: v.title,
          description: v.description || v['channel.name'] || '',
          thumbnail: v.thumbnail_url,
          views: v.views_total,
          duration: v.duration,
          externalUrl: v.url,
          isExternal: true,
          category: 'Dailymotion'
        }));
        setVideos(mapped);
        if (mapped.length === 0) setError('No videos returned from Dailymotion.');
      } else if (category === 'All') {
        const res = await mediaAPI.getAllMedia(1, 30);
        setVideos(res.media || []);
      } else {
        const res = await mediaAPI.getByCategory(category, 1, 30);
        setVideos(res.media || []);
      }
    } catch (err) {
      console.error('Failed to load explore', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>Explore</Typography>
      <Tabs value={active} onChange={(_, val) => setActive(val)} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto">
        {categories.map((c) => <Tab key={c} value={c} label={c} />)}
      </Tabs>
      {loading ? <LoadingSpinner /> : (
        <Grid container spacing={2}>
          {error && (
            <Grid item xs={12}>
              <Typography color="error" variant="body2">{error}</Typography>
            </Grid>
          )}
          {videos.map((video) => {
            const thumb = video.thumbnail
              ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${apiBase}${video.thumbnail}`)
              : undefined;
            return (
              <Grid item xs={12} sm={6} md={4} key={video._id}>
                <Card>
                  <CardActionArea onClick={() => video.isExternal ? window.open(video.externalUrl, '_blank') : navigate(`/media/play/${video._id}`)}>
                    <CardMedia component="img" image={thumb || '/placeholder.jpg'} alt={video.title} sx={{ height: 170, objectFit: 'cover' }} />
                    <CardContent>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap>{video.title}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>{video.description || 'No description'}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip size="small" label={video.category || 'Other'} />
                          <Typography variant="caption" color="text.secondary">{(video.views || 0)} views</Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default ExplorePage;
