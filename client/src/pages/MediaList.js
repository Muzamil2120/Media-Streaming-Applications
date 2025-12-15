import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MediaList.css';

function MediaList() {
  const [videos, setVideos] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Mock data - replace with API call
    const mockVideos = [
      {
        id: 1,
        title: 'Introduction to MERN Stack',
        description: 'Learn MERN stack development from scratch',
        duration: '10:30',
        thumbnail: '/thumb1.jpg',
        uploadDate: '2025-01-15',
        uploader: 'John Doe',
        views: 1500
      },
      {
        id: 2,
        title: 'Building Media Streaming Apps',
        description: 'Create streaming applications with MERN',
        duration: '15:45',
        thumbnail: '/thumb2.jpg',
        uploadDate: '2025-01-16',
        uploader: 'Jane Smith',
        views: 890
      },
      {
        id: 3,
        title: 'React Hooks Masterclass',
        description: 'Master React Hooks with practical examples',
        duration: '22:15',
        thumbnail: '/thumb3.jpg',
        uploadDate: '2025-01-17',
        uploader: 'Mike Johnson',
        views: 1200
      }
    ];
    setVideos(mockVideos);
  }, []);

  const handleDelete = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        // Mock delete - replace with API call
        setVideos(videos.filter(video => video.id !== videoId));
        alert('Video deleted successfully');
      } catch (error) {
        alert('Error deleting video');
      }
    }
  };

  return (
    <div className="media-list-container">
      <div className="media-header">
        <h1>🎥 All Videos</h1>
        {user && (
          <Link to="/media/new" className="upload-btn">
            📤 Upload New Video
          </Link>
        )}
      </div>

      <div className="videos-grid">
        {videos.map(video => (
          <div key={video.id} className="video-card">
            <Link to={`/media/play/${video.id}`} className="video-link">
              <div className="thumbnail">
                <div className="thumbnail-placeholder">🎬</div>
                <span className="duration">{video.duration}</span>
              </div>
            </Link>
            
            <div className="video-info">
              <h3>{video.title}</h3>
              <p className="description">{video.description}</p>
              
              <div className="video-meta">
                <span>👤 {video.uploader}</span>
                <span>📅 {video.uploadDate}</span>
                <span>👁️ {video.views} views</span>
              </div>

              {user && user.id === 1 && ( // Mock ownership check
                <div className="video-actions">
                  <Link 
                    to={`/media/edit/${video.id}`} 
                    className="edit-btn"
                  >
                    ✏️ Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(video.id)}
                    className="delete-btn"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MediaList;