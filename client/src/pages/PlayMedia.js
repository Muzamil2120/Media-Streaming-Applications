import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mediaAPI, commentAPI, userAPI, dailymotionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoadingSpinner from '../components/LoadingSpinner';

function PlayMedia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5002';
  const [media, setMedia] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [savingLater, setSavingLater] = useState(false);
  const [savedLater, setSavedLater] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError('');
    
    const fetchVideo = async () => {
      try {
        // Try backend first
        const res = await mediaAPI.getMediaById(id);
        const m = res.media || res;
        setMedia(m);
        setLiked(!!m?.liked);
        if (isAuthenticated) {
          userAPI.addToWatchHistory(id).catch(() => {});
        }
        
        // Fetch related data only if local video found
        mediaAPI.getRecommendations(id)
          .then(res => setRecommendations(res.recommendations || res.media || res || []))
          .catch(() => setRecommendations([]));
        commentAPI.getComments(id)
          .then(res => setComments(res.comments || res || []))
          .catch(() => setComments([]));

      } catch (err) {
        // If backend fails, try Dailymotion
        console.log('Local fetch failed, trying Dailymotion...', err);
        try {
          const dmVideo = await dailymotionAPI.getVideoById(id);
          setMedia({
            _id: dmVideo.id,
            title: dmVideo.title,
            description: dmVideo.description,
            filePath: dmVideo.url, // ReactPlayer handles DM URLs
            views: dmVideo.views_total,
            likes: 0,
            uploader: {
              _id: 'dm',
              name: dmVideo['channel.name'] || 'Dailymotion',
              avatar: null
            },
            created: new Date(dmVideo.created_time * 1000),
            isDailymotion: true
          });
          // Clear error if DM succeeds
          setError('');
        } catch (dmErr) {
          console.error('DM fetch failed:', dmErr);
          setError('Failed to load video');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, isAuthenticated]);

  const videoSrc = useMemo(() => {
    if (!media || !media.filePath) return '';
    if (media.filePath.startsWith('http')) return media.filePath;
    return `${apiBase}${media.filePath}`;
  }, [media, apiBase]);

  const handleLike = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setMedia((m) => ({ ...m, likes: Math.max(0, (m?.likes || 0) + (nextLiked ? 1 : -1)) }));
    const apiCall = nextLiked ? mediaAPI.likeMedia : mediaAPI.unlikeMedia;
    apiCall(id).catch((err) => {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('already liked')) {
        setLiked(true);
        setMedia((m) => ({ ...m, likes: Math.max(0, (m?.likes || 0)) }));
        return;
      }
      if (msg.toLowerCase().includes('not liked')) {
        setLiked(false);
        setMedia((m) => ({ ...m, likes: Math.max(0, (m?.likes || 0)) }));
        return;
      }
      // revert on unexpected failure
      setLiked(!nextLiked);
      setMedia((m) => ({ ...m, likes: Math.max(0, (m?.likes || 0) + (nextLiked ? -1 : 1)) }));
    });
  };

  const handleWatchLater = async () => {
    if (!media) return;
    try {
      setSavingLater(true);
      await userAPI.addToWatchLater(media._id);
      setSavedLater(true);
    } catch (err) {
      console.error('Add to watch later failed', err);
    } finally {
      setSavingLater(false);
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentAPI.createComment(id, commentText).then(res => {
      const newComment = res.comment || res;
      setComments([newComment, ...comments]);
      setCommentText('');
    }).catch(() => {});
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!media) return <Alert severity="warning">Video not found</Alert>;

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 1.5, md: 2 } }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} variant="outlined" size="small">
          Back
        </Button>
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 3 }}>
            {videoSrc ? (
              <CardMedia component="video" controls poster={media.thumbnail || undefined} src={videoSrc} sx={{ width: '100%', maxHeight: 520, backgroundColor: '#000' }} />
            ) : (
              <CardMedia component="img" src={media.thumbnail || '/placeholder.jpg'} alt={media.title} sx={{ width: '100%', maxHeight: 520 }} />
            )}
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h5" fontWeight={700}>{media.title}</Typography>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <Typography variant="body2" color="text.secondary">{media.views || 0} views</Typography>
                  <IconButton size="small" onClick={handleLike} color={liked ? 'primary' : 'default'}>
                    {liked ? <ThumbUpAltIcon fontSize="small" /> : <ThumbUpAltOutlinedIcon fontSize="small" />}
                  </IconButton>
                  <Typography variant="body2" color="text.secondary">{media.likes || 0}</Typography>
                  {media.category && <Chip size="small" label={media.category} />}
                  <Button size="small" variant="outlined" onClick={handleWatchLater} disabled={savingLater}>
                    {savedLater ? 'Saved' : 'Watch later'}
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2">{media.uploader?.name || media.uploader?.username || 'Unknown uploader'}</Typography>
                  {media.uploader?._id && (
                    <Button size="small" onClick={() => navigate(`/profile/${media.uploader._id}`)}>View profile</Button>
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary">{media.description || 'No description provided.'}</Typography>
                <Divider />
                <Stack component="form" direction={{ xs: 'column', sm: 'row' }} spacing={1} onSubmit={handleComment}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Add a public comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <Button type="submit" variant="contained">Comment</Button>
                </Stack>
                <Stack spacing={1}>
                  {comments.length === 0 && <Typography variant="body2" color="text.secondary">No comments yet.</Typography>}
                  {comments.map((c) => (
                    <Box key={c._id || c.id} sx={{ p: 1, borderRadius: 1, backgroundColor: '#f7f7f7' }}>
                      <Typography variant="subtitle2">{c.author?.name || c.author?.username || 'User'}</Typography>
                      <Typography variant="body2">{c.text}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>Recommended</Typography>
          <Stack spacing={1.5}>
            {recommendations.length === 0 && (
              <Typography variant="body2" color="text.secondary">No recommendations yet.</Typography>
            )}
            {recommendations.map((video) => {
              const recSrc = video.thumbnail
                ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${apiBase}${video.thumbnail}`)
                : '/placeholder.jpg';
              return (
                <Card key={video._id} sx={{ display: 'flex', cursor: 'pointer' }} onClick={() => navigate(`/media/play/${video._id}`)}>
                  <CardMedia component="img" image={recSrc} alt={video.title} sx={{ width: 140, height: 90, objectFit: 'cover' }} />
                  <CardContent sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>{video.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{video.views || 0} views</Typography>
                  </CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                    <PlayArrowIcon />
                  </Box>
                </Card>
              );
            })}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PlayMedia;