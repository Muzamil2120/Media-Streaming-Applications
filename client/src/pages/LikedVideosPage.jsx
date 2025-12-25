import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, CardMedia, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { useLikes } from '../context/LikesContext';

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const resolveThumb = (thumb) => {
  if (!thumb) return '/placeholder.svg';
  if (thumb.startsWith('http')) return thumb;
  return `${apiBase}${thumb}`;
};

function LikedVideosPage() {
  const navigate = useNavigate();
  const { likedVideos, removeLike } = useLikes();

  const items = useMemo(() => likedVideos, [likedVideos]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <ThumbUpAltIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>Liked videos</Typography>
      </Stack>

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          You haven’t liked any videos yet.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {items.map((v) => (
            <Card
              key={v.id}
              variant="outlined"
              sx={{ display: 'flex', cursor: 'pointer' }}
              onClick={() => navigate(`/media/play/${v.id}`)}
            >
              <CardMedia
                component="img"
                image={resolveThumb(v.thumbnail)}
                alt={v.title}
                sx={{ width: 220, height: 124, objectFit: 'cover' }}
              />
              <CardContent sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap>{v.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {v.uploader?.name || 'Unknown'}
                  </Typography>
                </Box>
                <Tooltip title="Unlike">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeLike(v.id);
                    }}
                    aria-label="Unlike"
                  >
                    <ThumbUpOffAltIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default LikedVideosPage;
