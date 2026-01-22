import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mediaAPI, commentAPI, userAPI, dailymotionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLikes } from '../context/LikesContext';
import VideoPlayer from '../components/VideoPlayer';
import Grid from '@mui/material/Grid';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
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
  const { isLiked, addLike, removeLike } = useLikes();

  const isMongoObjectId = useMemo(() => /^[a-f\d]{24}$/i.test(String(id || '')), [id]);
  const normalizeRemoteUrl = (u) => {
    if (!u || typeof u !== 'string') return '';
    if (u.startsWith('//')) return `https:${u}`;
    // Avoid mixed-content issues in production by upgrading common provider URLs.
    if (u.startsWith('http://')) {
      try {
        const parsed = new URL(u);
        const host = (parsed.hostname || '').toLowerCase();
        if (host.endsWith('dailymotion.com') || host.endsWith('dmcdn.net')) {
          return `https://${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
        }
      } catch {
        // ignore
      }
    }
    return u;
  };

  const pickPlayableDailymotionUrl = (dmVideo) => {
    const dmId = dmVideo?.id ? String(dmVideo.id) : '';

    const page = normalizeRemoteUrl(dmVideo?.url || '');
    if (page) return page;

    const embed = normalizeRemoteUrl(dmVideo?.embed_url || '');
    if (embed) {
      // Newer API responses often return geo.dailymotion.com/player.html?video=<id>
      // ReactPlayer's Dailymotion handler is most reliable with the canonical page URL.
      try {
        const parsed = new URL(embed);
        const qVideo = parsed.searchParams.get('video');
        const idFromEmbed = qVideo || dmId;
        if (idFromEmbed) return `https://www.dailymotion.com/video/${idFromEmbed}`;
      } catch {
        // ignore
      }
    }

    return dmId ? `https://www.dailymotion.com/video/${dmId}` : '';
  };

  const descriptionText = useMemo(() => {
    const raw = media?.description || 'No description provided.';
    // Convert <br> tags to newlines and render with whitespace preserved
    return raw.replace(/<br\s*\/?>/gi, '\n');
  }, [media]);

  useEffect(() => {
    setLoading(true);
    setError('');
    
    const fetchVideo = async () => {
      try {
        // If the ID looks like a Mongo ObjectId, load from our backend.
        // Otherwise assume it's a provider ID (e.g., Dailymotion) and skip the slow 404.
        if (isMongoObjectId) {
          const res = await mediaAPI.getMediaById(id);
          const m = res.media || res;
          setMedia(m);
          setLiked(isLiked(m?._id) || !!m?.liked);
          if (isAuthenticated) {
            userAPI.addToWatchHistory(id).catch(() => {});
          }

          // Related data only for local videos
          mediaAPI.getRecommendations(id)
            .then(res => setRecommendations(res.recommendations || res.media || res || []))
            .catch(() => setRecommendations([]));
          commentAPI.getComments(id)
            .then(res => setComments(res.comments || res || []))
            .catch(() => setComments([]));
          return;
        }

        const dmVideo = await dailymotionAPI.getVideoById(id);
        const dmThumb = normalizeRemoteUrl(dmVideo.thumbnail_720_url || dmVideo.thumbnail_480_url || dmVideo.thumbnail_url || '');
        const dmPlayableUrl = pickPlayableDailymotionUrl(dmVideo);

        setMedia({
          _id: dmVideo.id,
          title: dmVideo.title,
          description: dmVideo.description,
          // Prefer canonical page URL; embed_url can be geo.* player.html which ReactPlayer may not detect.
          filePath: dmPlayableUrl,
          thumbnail: dmThumb || null,
          views: dmVideo.views_total,
          likes: 0,
          uploader: {
            _id: 'dm',
            name: dmVideo['channel.name'] || 'Dailymotion',
            avatar: null
          },
          createdAt: dmVideo.created_time ? new Date(dmVideo.created_time * 1000).toISOString() : new Date().toISOString(),
          isDailymotion: true
        });
        setLiked(isLiked(dmVideo.id));
        setError('');
        setRecommendations([]);
        setComments([]);

      } catch (err) {
        console.error(err);
        setError(err?.message || 'Video not found. Please check the video ID and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, isAuthenticated, isLiked, isMongoObjectId]);

  const videoSrc = useMemo(() => {
    if (!media || !media.filePath) return '';
    if (media.filePath.startsWith('//')) return `https:${media.filePath}`;
    if (media.filePath.startsWith('http')) return media.filePath;
    return `${apiBase}${media.filePath}`;
  }, [media, apiBase]);

  const handleLike = () => {
    if (!media) return;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setMedia((m) => ({ ...m, likes: Math.max(0, (m?.likes || 0) + (nextLiked ? 1 : -1)) }));

    if (nextLiked) {
      addLike({
        id: media._id,
        title: media.title,
        thumbnail: media.thumbnail || '',
        uploader: {
          id: media.uploader?._id || '',
          name: media.uploader?.name || media.uploader?.username || 'Unknown',
        },
        likedAt: Date.now(),
      });
    } else {
      removeLike(media._id);
    }

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

      // revert local likes store too
      if (nextLiked) {
        removeLike(media._id);
      } else {
        addLike({
          id: media._id,
          title: media.title,
          thumbnail: media.thumbnail || '',
          uploader: {
            id: media.uploader?._id || '',
            name: media.uploader?.name || media.uploader?.username || 'Unknown',
          },
          likedAt: Date.now(),
        });
      }
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
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {videoSrc ? (
              <VideoPlayer url={videoSrc} title={media.title} videoId={media._id} />
            ) : (
              <CardMedia component="img" src={media.thumbnail || '/placeholder.svg'} alt={media.title} sx={{ width: '100%', maxHeight: 520 }} />
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
                <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 1.5 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                    {descriptionText}
                  </Typography>
                </Box>
                {Array.isArray(media.tags) && media.tags.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {media.tags.map((tag) => (
                      <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />
                    ))}
                  </Stack>
                )}
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
                    <Box key={c._id || c.id} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle2">{c.author?.name || c.author?.username || 'User'}</Typography>
                      <Typography variant="body2">{c.text}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" gutterBottom>Recommended</Typography>
          <Stack spacing={1.5}>
            {recommendations.length === 0 && (
              <Typography variant="body2" color="text.secondary">No recommendations yet.</Typography>
            )}
            {recommendations.map((video) => {
              const recSrc = video.thumbnail
                ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${apiBase}${video.thumbnail}`)
                : '/placeholder.svg';
              return (
                <Card key={video._id} variant="outlined" sx={{ display: 'flex', cursor: 'pointer' }} onClick={() => navigate(`/media/play/${video._id}`)}>
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