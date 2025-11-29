import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [userVideos, setUserVideos] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Mock user videos - replace with API call
    const mockVideos = [
      {
        id: 1,
        title: 'My First Video',
        views: 1500,
        uploadDate: '2025-01-15',
        likes: 45
      },
      {
        id: 2,
        title: 'Tutorial Series Part 1',
        views: 890,
        uploadDate: '2025-01-16',
        likes: 32
      }
    ];
    setUserVideos(mockVideos);
  }, []);

  if (!user) {
    return (
      <div className="profile-container">
        <div className="not-signed-in">
          <h2>Please sign in to view your profile</h2>
          <Link to="/signin" className="auth-link">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{userVideos.length}</span>
              <span className="stat-label">Videos</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {userVideos.reduce((total, video) => total + video.views, 0)}
              </span>
              <span className="stat-label">Total Views</span>
            </div>
          </div>
        </div>
        <Link to="/profile/edit" className="edit-profile-btn">
          Edit Profile
        </Link>
      </div>

      <div className="profile-content">
        <div className="videos-section">
          <h2>My Videos</h2>
          {userVideos.length === 0 ? (
            <div className="no-videos">
              <p>You haven't uploaded any videos yet.</p>
              <Link to="/media/new" className="upload-link">
                Upload Your First Video
              </Link>
            </div>
          ) : (
            <div className="user-videos">
              {userVideos.map(video => (
                <div key={video.id} className="user-video-card">
                  <h3>{video.title}</h3>
                  <div className="video-stats">
                    <span>👁️ {video.views} views</span>
                    <span>👍 {video.likes} likes</span>
                    <span>📅 {video.uploadDate}</span>
                  </div>
                  <div className="video-actions">
                    <Link 
                      to={`/media/play/${video.id}`} 
                      className="view-btn"
                    >
                      View
                    </Link>
                    <Link 
                      to={`/media/edit/${video.id}`} 
                      className="edit-btn"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;