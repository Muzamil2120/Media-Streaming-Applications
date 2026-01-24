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
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shortsLoading, setShortsLoading] = useState(true);
  const [error, setError] = useState('');
  const [shortsError, setShortsError] = useState('');
  const outletCtx = useOutletContext();
  const sidebarOpen = outletCtx && typeof outletCtx.sidebarOpen !== 'undefined' ? outletCtx.sidebarOpen : true;

  // Section refs for scrolling
  const topRef = useRef(null);

  const normalizeDMVideo = (video) => {
    const bestThumb = video.thumbnail_720_url || video.thumbnail_480_url || video.thumbnail_url;
    const safeThumb = typeof bestThumb === 'string' && bestThumb.startsWith('//') ? `https:${bestThumb}` : bestThumb;
    const safeUrl = (() => {
      const page = video.url;
      if (typeof page === 'string' && page.trim()) {
        if (page.startsWith('//')) return `https:${page}`;
        if (page.startsWith('http://')) return page.replace(/^http:\/\//i, 'https://');
        return page;
      }
      const id = video.id ? String(video.id) : '';
      return id ? `https://www.dailymotion.com/video/${id}` : '';
    })();

    return {
      _id: video.id,
      title: video.title,
      description: video.description,
      thumbnailUrl: safeThumb,
      views: video.views_total,
      duration: formatDuration(video.duration),
      uploader: {
        _id: 'dailymotion',
        username: video['channel.name'] || 'Dailymotion',
        avatar: null,
      },
      createdAt: video.created_time ? new Date(video.created_time * 1000).toISOString() : new Date().toISOString(),
      isDailymotion: true,
      filePath: safeUrl,
    };
  };

  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [localData, dmData] = await Promise.all([
        mediaAPI.getAllMedia().catch(() => []),
        dailymotionAPI.getTrending().catch(() => [])
      ]);

      const normalizedDM = dmData.map((video) => normalizeDMVideo(video));

      const localVideos = Array.isArray(localData) ? localData : (localData.media || []);
      const normalizedLocal = localVideos.map(video => {
        const rawThumb = video.thumbnail || video.thumbnailUrl || '';
        const normalizedThumb = rawThumb
          ? (rawThumb.startsWith('//')
            ? `https:${rawThumb}`
            : rawThumb.startsWith('http')
              ? rawThumb
              : `${process.env.REACT_APP_API_URL || 'http://localhost:5002'}${rawThumb}`)
          : '';

        const uploaderObj = video?.uploader && typeof video.uploader === 'object' ? video.uploader : null;
        const rawAvatar = uploaderObj?.avatar || video?.uploaderAvatar || '';
        const normalizedAvatar = rawAvatar
          ? (rawAvatar.startsWith('data:') || rawAvatar.startsWith('blob:')
            ? rawAvatar
            : rawAvatar.startsWith('//')
              ? `https:${rawAvatar}`
              : rawAvatar.startsWith('http')
                ? rawAvatar
                : `${process.env.REACT_APP_API_URL || 'http://localhost:5002'}${rawAvatar}`)
          : '';

        return {
          ...video,
          thumbnailUrl: normalizedThumb,
          avatarUrl: normalizedAvatar,
          uploader: video.uploader || video.postedBy || { username: 'Unknown' },
          duration: typeof video.duration === 'number' ? formatDuration(video.duration) : video.duration
        };
      });

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

  const loadShorts = useCallback(async () => {
    setShortsLoading(true);
    setShortsError('');
    try {
      const dmShorts = await dailymotionAPI.getShortsByTopic('shorts', 1, 12);
      setShorts(dmShorts.map((video) => normalizeDMVideo(video)));
    } catch (err) {
      setShortsError(err.message || 'Failed to load shorts');
      setShorts([]);
    } finally {
      setShortsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
    loadShorts();
  }, [loadVideos, loadShorts]);

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
                    {!video.isDailymotion && video.avatarUrl && (
                      <div className="dm-avatar">
                        <img
                          src={video.avatarUrl}
                          alt={video.uploader?.username || video.uploader?.name || 'Channel'}
                          onError={(e) => {
                            if (e.currentTarget.dataset.fallbackApplied) return;
                            e.currentTarget.dataset.fallbackApplied = 'true';
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    )}
                    <div className="dm-info-body">
                      <h3 className="dm-title" title={video.title}>{video.title}</h3>
                      <div className="dm-meta">
                        <span>{video.uploader?.username || video.uploader?.name || 'Unknown User'}</span>
                        <span>{video.views ? `${video.views} views` : 'No views'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <div className="shorts-title">
              <span className="shorts-pill">Shorts</span>
              <span className="shorts-subtitle">Quick picks from Dailymotion</span>
            </div>
          </div>

          {shortsLoading && <div className="loading">Loading shorts...</div>}
          {shortsError && <div className="error">{shortsError}</div>}
          {!shortsLoading && !shortsError && shorts.length === 0 && (
            <div className="no-videos">No shorts available.</div>
          )}

          {!shortsLoading && !shortsError && shorts.length > 0 && (
            <div className="shorts-row">
              {shorts.map((video) => (
                <div
                  key={video._id}
                  className="shorts-card"
                  onClick={() => navigate(`/media/play/${video._id}`)}
                >
                  <div className="shorts-thumb-wrapper">
                    <img
                      src={video.thumbnailUrl || '/placeholder.svg'}
                      alt={video.title}
                      className="shorts-thumb"
                    />
                    <span className="shorts-duration">{video.duration || '0:00'}</span>
                    <span className="shorts-badge">Shorts</span>
                  </div>
                  <div className="shorts-info">
                    <h3 className="shorts-title-text" title={video.title}>{video.title}</h3>
                    <div className="shorts-meta">
                      <span>{video.uploader?.username || 'Dailymotion'}</span>
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
