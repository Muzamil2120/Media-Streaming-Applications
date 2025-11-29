import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PlayMedia.css';

function PlayMedia() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock video data - replace with API call
    const mockVideo = {
      id: parseInt(id),
      title: `Video ${id} - Sample Content`,
      description: 'This is a sample video description for demonstration purposes.',
      duration: '15:30',
      uploadDate: '2025-01-15',
      uploader: 'Demo User',
      views: 1250,
      likes: 45
    };
    
    setVideo(mockVideo);
    setLoading(false);
  }, [id]);

  if (loading) {
    return <div className="loading">Loading video...</div>;
  }

  if (!video) {
    return (
      <div className="error-container">
        <h2>Video not found</h2>
        <Link to="/media" className="back-link">← Back to Videos</Link>
      </div>
    );
  }

  return (
    <div className="play-media-container">
      <div className="video-player-section">
        <div className="video-player">
          <div className="video-placeholder">
            <div className="play-icon">▶</div>
            <p>Video Player - Now Playing</p>
            <h3>{video.title}</h3>
          </div>
        </div>
        
        <div className="video-info">
          <h1>{video.title}</h1>
          <div className="video-stats">
            <span>👁️ {video.views} views</span>
            <span>📅 {video.uploadDate}</span>
            <span>👍 {video.likes} likes</span>
          </div>
          <p className="video-description">{video.description}</p>
          <div className="video-actions">
            <button className="action-btn like-btn">👍 Like</button>
            <button className="action-btn share-btn">📤 Share</button>
          </div>
        </div>
      </div>

      <div className="navigation-section">
        <Link to="/media" className="back-btn">← Back to Videos</Link>
      </div>
    </div>
  );
}

export default PlayMedia;