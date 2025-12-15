import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MediaForm.css';

function EditMedia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockVideo = {
      id: parseInt(id),
      title: `Video ${id} - Sample Content`,
      description: 'This is a sample video description for demonstration purposes.',
      category: 'education',
      tags: 'sample, demo, video'
    };
    
    setFormData(mockVideo);
    setLoading(false);
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Mock update - replace with API call
      alert('Video updated successfully!');
      navigate('/media');
    } catch (error) {
      alert('Update failed. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="media-form-container">
      <div className="form-header">
        <h1>✏️ Edit Video</h1>
        <p>Update your video information</p>
      </div>

      <form onSubmit={handleSubmit} className="media-form">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
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
          <button type="submit" className="submit-btn">
            Update Video
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditMedia;