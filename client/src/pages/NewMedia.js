import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MediaForm.css';

function NewMedia() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Mock upload - replace with actual API call
      setTimeout(() => {
        alert('Video uploaded successfully!');
        navigate('/media');
      }, 2000);
    } catch (error) {
      alert('Upload failed. Please try again.');
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
              {file ? file.name : 'Choose video file (MP4, AVI, MOV, WMV)'}
            </div>
          </div>
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
            <option value="">Select category</option>
            <option value="education">Education</option>
            <option value="entertainment">Entertainment</option>
            <option value="technology">Technology</option>
            <option value="music">Music</option>
            <option value="sports">Sports</option>
          </select>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Enter tags separated by commas"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/media')}
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