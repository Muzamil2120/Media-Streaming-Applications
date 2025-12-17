import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mediaAPI, dailymotionAPI } from '../services/api';
import { formatDuration } from '../utils/formatters';
import './MediaList.css';

function MediaList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const fetchVideos = async () => {
      try {
        setLoading(true);
        
        // Fetch from both sources in parallel
        const [localData, dmData] = await Promise.all([
          mediaAPI.getAllMedia().catch(err => {
            console.error('Local fetch failed:', err);
            return [];
          }),
          dailymotionAPI.getTrending().catch(err => {
            console.error('DM fetch failed:', err);
            return [];
          })
        ]);

        // Normalize Dailymotion videos
        const normalizedDM = dmData.map(video => ({
          _id: video.id,
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnail_url,
          views: video.views_total,
          duration: formatDuration(video.duration),
          uploader: {
            _id: 'dailymotion',
            username: video['channel.name'] || 'Dailymotion',
            avatar: null
          },
          created: new Date(), // DM doesn't provide created time in simple list easily
          isDailymotion: true
        }));

        // Normalize Local videos (fix field names if needed)
        const localVideos = Array.isArray(localData) ? localData : (localData.media || []);
        const normalizedLocal = localVideos.map(video => ({
          ...video,
          thumbnailUrl: video.thumbnail || video.thumbnailUrl, // Handle both
          uploader: video.uploader || video.postedBy || { username: 'Unknown' }, // Handle both
          duration: typeof video.duration === 'number' ? formatDuration(video.duration) : video.duration
        }));

        setVideos([...normalizedLocal, ...normalizedDM]);
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleDelete = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await mediaAPI.deleteMedia(videoId);
        setVideos(videos.filter(video => video._id !== videoId));
        alert('Video deleted successfully');
      } catch (error) {
        alert('Error deleting video');
      }
    }
  };

  if (loading) return <div className="loading">Loading videos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="media-list-container">
      <div className="media-header">
        <h1>🎥 All Videos</h1>
        {user && (
          <Link to="/upload" className="upload-btn">
            📤 Upload New Video
          </Link>
        )}
      </div>

      <div className="videos-grid">
        {videos.length === 0 && <div className="no-videos">No videos found. Be the first to upload!</div>}
        {videos.map(video => (
          <div key={video._id} className="video-card">
            <Link to={`/media/play/${video._id}`} className="video-link">
              <div className="thumbnail">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.title} />
                ) : (
                  <div className="thumbnail-placeholder">🎬</div>
                )}
                {video.duration && <span className="duration">{video.duration}</span>}
              </div>
            </Link>
            
            <div className="video-info">
              <h3>{video.title}</h3>
              <p className="description">{video.description}</p>
              
              <div className="video-meta">
                <span>👤 {video.uploader?.username || video.uploader?.name || 'Unknown'}</span>
                <span>📅 {video.created ? new Date(video.created).toLocaleDateString() : 'Recently'}</span>
                <span>👁️ {video.views || 0} views</span>
              </div>

              {user && !video.isDailymotion && user._id === video.uploader?._id && (
                <div className="video-actions">
                  <Link 
                    to={`/media/edit/${video._id}`} 
                    className="edit-btn"
                  >
                    ✏️ Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(video._id)}
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
