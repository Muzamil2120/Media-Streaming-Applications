import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { mediaAPI, dailymotionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDuration } from '../utils/formatters';
import './Home.css';

function Home({ initialNav = 'home' }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const outletCtx = useOutletContext();
  const sidebarOpen = outletCtx && typeof outletCtx.sidebarOpen !== 'undefined' ? outletCtx.sidebarOpen : true;

  // Section refs for scrolling
  const topRef = useRef(null);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [localData, dmData] = await Promise.all([
        mediaAPI.getAllMedia().catch(() => []),
        dailymotionAPI.getTrending().catch(() => [])
      ]);

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
        created: new Date(),
        isDailymotion: true
      }));

      const localVideos = Array.isArray(localData) ? localData : (localData.media || []);
      const normalizedLocal = localVideos.map(video => ({
        ...video,
        thumbnailUrl: video.thumbnail || video.thumbnailUrl,
        uploader: video.uploader || video.postedBy || { username: 'Unknown' },
        duration: typeof video.duration === 'number' ? formatDuration(video.duration) : video.duration
      }));

      const filteredLocal = user?._id
        ? normalizedLocal.filter((v) => (v?.uploader?._id || v?.uploader?.id) !== user._id)
        : normalizedLocal;

      setVideos([...filteredLocal, ...normalizedDM]);
    } catch (err) {
      setError(err.message || 'Failed to load videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  return (
    <div className={`home-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`} ref={topRef}>
      <div className="home-shell">
        <section className="section">
          <div className="section-header">
            <h2>Recommended</h2>
          </div>
          
          {loading && <div className="loading">Loading videos...</div>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && videos.length === 0 && (
            <div className="no-videos">No videos found. Be the first to upload!</div>
          )}
          
          {!loading && !error && videos.length > 0 && (
            <div className="dm-grid">
              {videos.map(video => (
                <div
                  key={video._id}
                  className="dm-card"
                  onClick={() => navigate(`/media/play/${video._id}`)}
                >
                  <div className="dm-thumb-wrapper">
                    <img 
                      src={video.thumbnailUrl || '/placeholder.svg'} 
                      alt={video.title} 
                      className="dm-thumb" 
                    />
                    <span className="dm-duration">
                      {video.duration || '0:00'}
                    </span>
                  </div>
                  <div className="dm-info">
                    <h3 className="dm-title" title={video.title}>{video.title}</h3>
                    <div className="dm-meta">
                      <span>{video.uploader?.username || video.uploader?.name || 'Unknown User'}</span>
                      <span>{video.views ? `${video.views} views` : 'No views'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;
