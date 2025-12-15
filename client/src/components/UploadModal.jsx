import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  IconButton,
  Alert,
  Paper,
} from '@mui/material';
import {
  Close,
  CloudUpload,
  CheckCircle,
  Image,
  Title,
  Description,
  Category,
  Tag,
  Public,
  Lock,
  Schedule,
  ThumbUp,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const UploadModal = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [],
    visibility: 'public',
    thumbnail: null,
    scheduleDate: '',
    monetization: false,
  });

  const steps = ['Upload Video', 'Details', 'Settings', 'Review'];

  const onDrop = useCallback((acceptedFiles) => {
    setUploadedFiles(acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    ));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    },
    maxFiles: 1,
    maxSize: 104857600, // 100MB
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    setUploading(true);
    // Simulate upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploading(false);
            onClose();
            setActiveStep(0);
            setUploadProgress(0);
            setUploadedFiles([]);
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                p: 8,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? 'primary.50' : 'transparent',
                transition: 'all 0.3s',
                mb: 3,
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop the video here' : 'Drag & drop video file'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                or click to browse files
              </Typography>
              <Typography variant="caption" color="text.secondary">
                MP4, MOV, AVI, MKV or WebM (Max 100MB)
              </Typography>
            </Box>

            {uploadedFiles.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle sx={{ color: 'success.main' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">
                      {uploadedFiles[0].name}
                    </Typography>
                    <Typography variant="caption">
                      {(uploadedFiles[0].size / (1024 * 1024)).toFixed(2)} MB
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setUploadedFiles([])}>
                    <Close />
                  </IconButton>
                </Box>
              </Paper>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Video Preview */}
              <Box sx={{ width: '40%' }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  {uploadedFiles[0]?.preview ? (
                    <video
                      src={uploadedFiles[0].preview}
                      style={{ width: '100%', borderRadius: 8 }}
                      controls
                    />
                  ) : (
                    <Box sx={{ py: 4 }}>
                      <Image sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Video Preview
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>

              {/* Form Fields */}
              <Box sx={{ width: '60%' }}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  InputProps={{
                    startAdornment: <Title sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  InputProps={{
                    startAdornment: <Description sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Category"
                    startAdornment={<Category sx={{ mr: 1, color: 'text.secondary' }} />}
                  >
                    <MenuItem value="education">Education</MenuItem>
                    <MenuItem value="entertainment">Entertainment</MenuItem>
                    <MenuItem value="technology">Technology</MenuItem>
                    <MenuItem value="music">Music</MenuItem>
                    <MenuItem value="sports">Sports</MenuItem>
                    <MenuItem value="gaming">Gaming</MenuItem>
                    <MenuItem value="lifestyle">Lifestyle</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  })}
                  InputProps={{
                    startAdornment: <Tag sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{ mb: 2 }}
                />

                {formData.tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {formData.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Visibility</InputLabel>
              <Select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                label="Visibility"
              >
                <MenuItem value="public">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Public />
                    <Box>
                      <Typography>Public</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Anyone can watch
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="private">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Lock />
                    <Box>
                      <Typography>Private</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Only you can watch
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="unlisted">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule />
                    <Box>
                      <Typography>Unlisted</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Anyone with the link can watch
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="datetime-local"
              label="Schedule"
              InputLabelProps={{ shrink: true }}
              value={formData.scheduleDate}
              onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ThumbUp />
                <Box>
                  <Typography>Monetization</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Earn money from your video
                  </Typography>
                </Box>
              </Box>
              <Button
                variant={formData.monetization ? 'contained' : 'outlined'}
                onClick={() => setFormData({ ...formData, monetization: !formData.monetization })}
              >
                {formData.monetization ? 'Enabled' : 'Enable'}
              </Button>
            </Box>

            <Alert severity="info">
              Thumbnail upload and advanced settings can be configured after upload.
            </Alert>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review your upload
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {uploadedFiles[0]?.preview && (
                  <video
                    src={uploadedFiles[0].preview}
                    style={{ width: 200, borderRadius: 8 }}
                    controls
                  />
                )}
                <Box>
                  <Typography variant="h6">{formData.title || 'Untitled Video'}</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {formData.description || 'No description'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip label={formData.category} size="small" />
                    <Chip label={formData.visibility} size="small" />
                    {formData.monetization && <Chip label="Monetized" size="small" color="success" />}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    File: {uploadedFiles[0]?.name} • Size: {(uploadedFiles[0]?.size / (1024 * 1024)).toFixed(2)} MB
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {uploading && (
              <Box>
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 1 }} />
                <Typography variant="body2" align="center">
                  Uploading... {uploadProgress}%
                </Typography>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Upload Video</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent(activeStep)}
          </motion.div>
        </AnimatePresence>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || uploading}
        >
          Back
        </Button>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Button
          onClick={onClose}
          disabled={uploading}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={
            (activeStep === 0 && uploadedFiles.length === 0) ||
            (activeStep === 1 && !formData.title) ||
            uploading
          }
          endIcon={activeStep === steps.length - 1 ? <CloudUpload /> : null}
        >
          {activeStep === steps.length - 1 
            ? (uploading ? 'Uploading...' : 'Upload Video')
            : 'Next'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadModal;