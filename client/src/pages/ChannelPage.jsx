import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const ChannelPage = () => {
  const { id: rawParamId } = useParams();
  const paramId = rawParamId && rawParamId !== 'undefined' ? rawParamId : undefined;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const channelId = useMemo(() => paramId || user?._id || user?.id, [paramId, user]);

  const isOwner = channel && user && (channel._id === user._id || channel._id === user.id || channel.id === (user._id || user.id));
  const isSubscribed = useMemo(() => {
    if (!channel || !user) return false;
    const subs = channel.subscribers || [];
    return subs.some((s) => s === (user._id || user.id) || (s && s._id === (user._id || user.id)));
  }, [channel, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, uploadsRes] = await Promise.all([
        userAPI.getUserProfile(channelId),
        userAPI.getUserUploads(channelId, 1, 50),
      ]);
      const fetched = profileRes?.user || profileRes;
      setChannel(fetched);
      const list = uploadsRes.uploads || uploadsRes || [];
      setUploads(list);
    } catch (err) {
      console.error('Failed to load channel', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (channelId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  const handleSubscribe = async () => {
    if (!channelId) return;
    try {
      setSubmitting(true);
      if (isSubscribed) {
        await userAPI.unsubscribe(channelId);
      } else {
        await userAPI.subscribe(channelId);
      }
      await fetchData();
    } catch (err) {
      console.error('Subscription toggle failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!channel) return <Typography>Channel not found</Typography>;

  return (
    <Box>
      <Box
        sx={{
          height: 220,
          borderRadius: 3,
          mb: 3,
          background: channel.banner
            ? `url(${channel.banner}) center/cover`
            : 'linear-gradient(135deg, #2563eb, #9333ea)',
        }}
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3}>
        <Avatar
          src={channel.avatar || undefined}
          alt={channel.username || channel.name}
          sx={{ width: 96, height: 96, border: '4px solid white', boxShadow: 3 }}
        />
        <Stack spacing={0.5} flex={1}>
          <Typography variant="h5" fontWeight={700}>{channel.name || channel.username}</Typography>
          <Typography variant="body2" color="text.secondary">{channel.bio || 'No channel description yet.'}</Typography>
          <Stack direction="row" spacing={2} mt={0.5}>
            <Typography variant="body2" color="text.secondary">{(channel.subscribers || []).length} subscribers</Typography>
            <Typography variant="body2" color="text.secondary">{uploads.length} videos</Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1}>
          {isOwner && (
            <Button variant="outlined" onClick={() => navigate('/profile/edit')}>
              Edit Channel
            </Button>
          )}
          {!isOwner && (
            <Button variant="contained" disabled={submitting} onClick={handleSubscribe}>
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
          )}
        </Stack>
      </Stack>

      <Typography variant="h6" gutterBottom>Uploads</Typography>
      <Grid container spacing={2}>
        {uploads.map((video) => {
          const thumb = video.thumbnail
            ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${apiBase}${video.thumbnail}`)
            : undefined;
          return (
            <Grid key={video._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardActionArea onClick={() => navigate(`/media/play/${video._id}`)}>
                  <CardMedia
                    component="img"
                    image={thumb || '/placeholder.svg'}
                    alt={video.title}
                    sx={{ height: 180, objectFit: 'cover' }}
                  />
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
    </Box>
  );
};

export default ChannelPage;
