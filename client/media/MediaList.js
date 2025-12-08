import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip
} from '@mui/material';
import { PlayArrow, Edit, Delete, Visibility, ThumbUp } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { mediaAPI } from '../services/api';

const MediaList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await mediaAPI.getAllMedia();
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await mediaAPI.deleteMedia(id);
        setVideos(videos.filter(video => video._id !== id));
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading videos...</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header with Upload Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2 
      }}>
        <Typography variant="h4" component="h1">
          All Videos
        </Typography>
        <Button
          component={Link}
          to="/upload"
          variant="contained"
          color="primary"
          startIcon={<Add />}
          size="large"
        >
          Upload New Video
        </Button>
      </Box>

      {/* Videos Grid */}
      <Grid container spacing={3}>
        {videos.map((video) => (
          <Grid item xs={12} sm={6} md={4} key={video._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Thumbnail */}
              <CardMedia
                component="img"
                height="200"
                image={video.thumbnailUrl || '/default-thumbnail.jpg'}
                alt={video.title}
                sx={{ cursor: 'pointer' }}
                onClick={() => window.open(`/watch/${video._id}`, '_blank')}
              />
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {video.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {video.description.length > 100 
                    ? `${video.description.substring(0, 100)}...` 
                    : video.description}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Chip 
                    label={video.category} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={video.duration} 
                    size="small" 
                    icon={<PlayArrow fontSize="small" />}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {video.uploaderName || 'Anonymous'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Visibility fontSize="small" />
                    <Typography variant="caption">
                      {video.views} views
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThumbUp fontSize="small" />
                    <Typography variant="caption">
                      {video.likes?.length || 0} likes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  color="primary" 
                  component={Link} 
                  to={`/watch/${video._id}`}
                  startIcon={<PlayArrow />}
                >
                  Watch
                </Button>
                <Button 
                  size="small" 
                  color="secondary"
                  component={Link}
                  to={`/edit/${video._id}`}
                  startIcon={<Edit />}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  color="error"
                  onClick={() => handleDelete(video._id)}
                  startIcon={<Delete />}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MediaList;