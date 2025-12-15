import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mediaAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MediaForm.css';

function NewMedia() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: '',
    isPublic: true
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!file) {
      setError('Please select a video file');
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('video', file);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('tags', formData.tags);
      uploadFormData.append('isPublic', formData.isPublic);

      await mediaAPI.upload(uploadFormData);
      navigate('/media');
    } catch (error) {
      setError(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="media-form-container">
      <div className="form-header">
        <h1>📤 Upload New Video</h1>
        <p>Share your content with the world</p>
      </div>

      <form onSubmit={handleSubmit} className="media-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Video File *</label>
          <div className="file-upload">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              required
            />
            <div className="file-info">
              {file ? `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)` : 'Choose video file (MP4, AVI, MOV, WMV, MKV, WEBM)'}
            </div>
          </div>
          <small>Max file size: 100MB</small>
        </div>

        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter video title"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your video content"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="general">General</option>
            <option value="education">Education</option>
            <option value="entertainment">Entertainment</option>
            <option value="technology">Technology</option>
            <option value="music">Music</option>
            <option value="sports">Sports</option>
            <option value="gaming">Gaming</option>
          </select>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Enter tags separated by commas (e.g., tutorial, react, webdev)"
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
            />
            Make this video public
          </label>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/media')}
            disabled={uploading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewMedia;