import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
} from '@mui/material';
import { CloudUpload, Cancel } from '@mui/icons-material';

const UploadPage = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'education',
    tags: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setUploading(true);
    // Simulate upload
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return Math.min(oldProgress + 10, 100);
      });
    }, 500);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Upload New Video
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* File Upload */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              sx={{ py: 3, px: 6, borderRadius: 2 }}
            >
              Select Video File
              <input type="file" hidden accept="video/*" />
            </Button>
          </Box>

          {/* Progress Bar */}
          {uploading && (
            <Box sx={{ width: '100%', mb: 3 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                Uploading: {progress}%
              </Typography>
            </Box>
          )}

          {/* Title */}
          <TextField
            fullWidth
            label="Video Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
            disabled={uploading}
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            required
            disabled={uploading}
          />

          {/* Category */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              label="Category"
              disabled={uploading}
            >
              <MenuItem value="education">Education</MenuItem>
              <MenuItem value="entertainment">Entertainment</MenuItem>
              <MenuItem value="technology">Technology</MenuItem>
              <MenuItem value="music">Music</MenuItem>
              <MenuItem value="sports">Sports</MenuItem>
            </Select>
          </FormControl>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              disabled={uploading}
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<CloudUpload />}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default UploadPage;