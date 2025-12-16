import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dailymotionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const DM_TOPICS = ['all', 'music', 'gaming', 'sports', 'tech', 'news', 'movies', 'vlogs', 'education', 'comedy'];

function Home() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [dmLongVideos, setDmLongVideos] = useState([]);
  const [loadingDmLong, setLoadingDmLong] = useState(true);
  const [dmLongError, setDmLongError] = useState('');
  const [dmTopic, setDmTopic] = useState('all');
  const [activeNav, setActiveNav] = useState('home');

  // Section refs for scrolling
  const topRef = useRef(null);

  const loadDmLong = async (topic) => {
    setLoadingDmLong(true);
    setDmLongError('');
    try {
      const list = topic === 'all'
        ? await dailymotionAPI.getTrending(1, 12)
        : await dailymotionAPI.search(topic, 1, 12);
      const longOnly = (list || []).filter(v => (v.duration || 0) >= 180);
      setDmLongVideos(longOnly.length ? longOnly : (list || []));
    } catch (err) {
      setDmLongError(err.message || 'Failed to load Dailymotion videos');
      setDmLongVideos([]);
    } finally {
      setLoadingDmLong(false);
    }
  };

  useEffect(() => {
    loadDmLong(dmTopic);
  }, [dmTopic]);

  const sectionMap = {
    home: topRef
  };

  const handleNavClick = (key) => {
    if (key === 'switch') {
      logout();
      navigate('/signin', { replace: true });
      return;
    }

    if (key === 'uploads') {
      navigate('/upload');
      return;
    }

    setActiveNav(key);
    const ref = sectionMap[key];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="home-layout" ref={topRef}>
      <aside className="side-nav">
        <div className="side-nav-section">
          <div className={`side-nav-item ${activeNav === 'home' ? 'active' : ''}`} onClick={() => handleNavClick('home')}>Home</div>
        </div>
        <div className="side-nav-section">
          <div className={`side-nav-item ${activeNav === 'uploads' ? 'active' : ''}`} onClick={() => handleNavClick('uploads')}>Upload</div>
        </div>
        <div className="side-nav-section">
          <div className="side-nav-item" onClick={() => handleNavClick('switch')}>Switch account</div>
        </div>
      </aside>

      <div className="home-shell">
        <section className="section">
          <div className="section-header">
            <h2>Dailymotion longform</h2>
            <span className="section-meta">External · {dmTopic}</span>
          </div>
          <div className="dm-pill-row">
            {DM_TOPICS.map(topic => (
              <button
                key={topic}
                className={`dm-pill ${dmTopic === topic ? 'dm-pill-active' : ''}`}
                onClick={() => setDmTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
          {loadingDmLong && <div className="loading">Loading long videos...</div>}
          {dmLongError && <div className="error">{dmLongError}</div>}
          {!loadingDmLong && !dmLongError && (
            <div className="dm-grid">
              {dmLongVideos.map(video => (
                <div key={video.id} className="dm-card" onClick={() => window.open(video.url, '_blank')} role="button">
                  <div className="dm-thumb">
                    <img src={video.thumbnail_url} alt={video.title} />
                    <span className="dm-duration">{Math.max(0, video.duration)}s</span>
                  </div>
                  <div className="dm-body">
                    <div className="dm-title" title={video.title}>{video.title}</div>
                    <div className="dm-meta">{video['channel.name'] || 'Channel'} • {video.views_total || 0} views</div>
                  </div>
                </div>
              ))}
              {dmLongVideos.length === 0 && <div className="error">No long videos found</div>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;