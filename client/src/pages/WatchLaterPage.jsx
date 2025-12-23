import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Divider
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const formatCompactNumber = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  return Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(num);
};

const formatDate = (input) => {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
};

const pad2 = (n) => String(n).padStart(2, '0');
const formatDuration = (seconds) => {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s <= 0) return '';
  const total = Math.floor(s);
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  if (hh > 0) return `${hh}:${pad2(mm)}:${pad2(ss)}`;
  return `${mm}:${pad2(ss)}`;
};

const WatchLaterPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeId, setActiveId] = useState(null);

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

  const openMenu = (event, id) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setActiveId(id);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setActiveId(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1.5, md: 2 } }}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Watch Later</Typography>
        <Typography variant="body2" color="text.secondary">
          {items.length} {items.length === 1 ? 'video' : 'videos'}
        </Typography>
      </Stack>

      {items.length === 0 ? (
        <Typography color="text.secondary">No videos saved for later.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {items.map((video) => {
            const thumb = video.thumbnail
              ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${apiBase}${video.thumbnail}`)
              : '/placeholder.svg';

            const uploaderName = video.uploader?.username || video.uploader?.name || 'Unknown channel';
            const viewsText = `${formatCompactNumber(video.views || 0)} views`;
            const dateText = formatDate(video.createdAt || video.created || video.updatedAt);
            const durationText = formatDuration(video.duration);

            return (
              <Card
                key={video._id}
                variant="outlined"
                sx={{ borderRadius: 2, overflow: 'hidden' }}
              >
                <CardActionArea onClick={() => navigate(`/media/play/${video._id}`)}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '280px 1fr' },
                      alignItems: 'stretch'
                    }}
                  >
                    <Box sx={{ position: 'relative', bgcolor: 'black' }}>
                      <Box sx={{ width: '100%', aspectRatio: '16 / 9', overflow: 'hidden' }}>
                        <CardMedia
                          component="img"
                          src={thumb}
                          alt={video.title}
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>

                      {durationText && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: 'rgba(0,0,0,0.75)'
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700 }}>
                            {durationText}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <CardContent sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.25 }} noWrap>
                          {video.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {uploaderName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }} noWrap>
                          {viewsText}{dateText ? ` • ${dateText}` : ''}
                        </Typography>

                        <Divider sx={{ my: 1.25 }} />

                        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: '-webkit-box' }, overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {video.description || 'No description'}
                        </Typography>
                      </Box>

                      <IconButton
                        aria-label="more"
                        onClick={(e) => openMenu(e, video._id)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </CardContent>
                  </Box>
                </CardActionArea>
              </Card>
            );
          })}
        </Stack>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={async () => {
            const id = activeId;
            closeMenu();
            if (id) await handleRemove(id);
          }}
        >
          Remove from Watch later
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default WatchLaterPage;
