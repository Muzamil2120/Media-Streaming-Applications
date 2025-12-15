import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mediaAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import './Home.css';

const CATEGORIES = ['All', 'Education', 'Entertainment', 'Music', 'Gaming', 'Sports', 'Tech', 'Vlogs', 'News', 'Other'];

function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [history, setHistory] = useState([]);
  const [subsFeed, setSubsFeed] = useState([]);
  const [category, setCategory] = useState('All');
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [error, setError] = useState('');
  const [activeNav, setActiveNav] = useState('home');

  // Section refs for scrolling
  const topRef = useRef(null);
  const forYouRef = useRef(null);
  const trendingRef = useRef(null);
  const shortsRef = useRef(null);
  const subsRef = useRef(null);
  const historyRef = useRef(null);

  useEffect(() => {
    setLoadingTrending(true);
    mediaAPI.getTrending()
      .then(res => {
        const list = Array.isArray(res) ? res : (res.media || []);
        setTrending(list);
      })
      .catch(err => setError(err.message || 'Failed to load trending'))
      .finally(() => setLoadingTrending(false));

    setLoadingLatest(true);
    mediaAPI.getAllMedia(1, 30)
      .then(res => {
        const list = res.media || res || [];
        setLatest(list);
      })
      .catch(err => setError(err.message || 'Failed to load videos'))
      .finally(() => setLoadingLatest(false));

    setLoadingHistory(true);
    userAPI.getWatchHistory()
      .then(res => {
        const list = res.history || res || [];
        setHistory(list);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      setSubsFeed([]);
      setLoadingSubs(false);
      return;
    }
    setLoadingSubs(true);
    const userId = user.id || user._id;
    userAPI.getSubscriptions(userId)
      .then(res => {
        const list = res.media || res.subscriptions || res || [];
        setSubsFeed(list);
      })
      .catch(() => setSubsFeed([]))
      .finally(() => setLoadingSubs(false));
  }, [authLoading, isAuthenticated, user]);

  const sectionMap = {
    home: topRef,
    foryou: forYouRef,
    trending: trendingRef,
    shorts: shortsRef,
    subscriptions: subsRef,
    history: historyRef,
    library: historyRef
  };

  const handleNavClick = (key) => {
    if (key === 'switch') {
      logout();
      navigate('/signin', { replace: true });
      return;
    }

    if (key === 'myvideos') {
      navigate('/my-uploads');
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

  const filteredLatest = useMemo(() => {
    if (category === 'All') return latest;
    return latest.filter(v => (v.category || '').toLowerCase() === category.toLowerCase());
  }, [latest, category]);

  const shorts = useMemo(() => {
    if (latest.length === 0) return [];
    const shortLike = latest.filter(v => (v.duration || 0) <= 90);
    if (shortLike.length > 0) return shortLike.slice(0, 12);
    return latest.slice(0, 12);
  }, [latest]);

  return (
    <div className="home-layout" ref={topRef}>
      <aside className="side-nav">
        <div className="side-nav-section">
          <div className={`side-nav-item ${activeNav === 'home' ? 'active' : ''}`} onClick={() => handleNavClick('home')}>Home</div>
          <div className={`side-nav-item ${activeNav === 'subscriptions' ? 'active' : ''}`} onClick={() => handleNavClick('subscriptions')}>Subscriptions</div>
          <div className={`side-nav-item ${activeNav === 'library' ? 'active' : ''}`} onClick={() => handleNavClick('library')}>Library</div>
          <div className={`side-nav-item ${activeNav === 'history' ? 'active' : ''}`} onClick={() => handleNavClick('history')}>History</div>
        </div>
        <div className="side-nav-section">
          <div className={`side-nav-item ${activeNav === 'myvideos' ? 'active' : ''}`} onClick={() => handleNavClick('myvideos')}>My videos</div>
          <div className={`side-nav-item ${activeNav === 'uploads' ? 'active' : ''}`} onClick={() => handleNavClick('uploads')}>Upload</div>
          <div className={`side-nav-item ${activeNav === 'trending' ? 'active' : ''}`} onClick={() => handleNavClick('trending')}>Trending</div>
        </div>
        <div className="side-nav-section">
          <div className="side-nav-item" onClick={() => handleNavClick('switch')}>Switch account</div>
        </div>
      </aside>

      <div className="home-shell">
        <div className="pill-row">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`pill ${category === cat ? 'pill-active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="section" ref={forYouRef}>
        <div className="section-header">
          <h2>For you</h2>
          <span className="section-meta">{filteredLatest.length} videos</span>
        </div>
        {loadingLatest && <div className="loading">Loading feed...</div>}
        {error && <div className="error">{error}</div>}
        {!loadingLatest && !error && (
          <div className="video-grid">
            {filteredLatest.map(video => (
              <VideoCard key={video._id} media={video} />
            ))}
          </div>
        )}
      </section>

      <section className="section" ref={trendingRef}>
        <div className="section-header">
          <h2>Trending now</h2>
          <span className="section-meta">Updated live</span>
        </div>
        {loadingTrending && <div className="loading">Loading trending...</div>}
        {!loadingTrending && trending.length === 0 && (
          <div className="error">No trending videos yet</div>
        )}
        <div className="video-grid">
          {trending.map(video => (
            <VideoCard key={video._id} media={video} />
          ))}
        </div>
      </section>

      <section className="section" ref={shortsRef}>
        <div className="section-header">
          <h2>Shorts</h2>
          <span className="section-meta">Quick clips</span>
        </div>
        <div className="rail">
          {shorts.map(video => (
            <div key={video._id} className="rail-item">
              <VideoCard media={video} compact />
            </div>
          ))}
        </div>
        {shorts.length === 0 && !loadingLatest && <div className="error">No shorts yet</div>}
      </section>

      <section className="section" ref={subsRef}>
        <div className="section-header">
          <h2>From your subscriptions</h2>
          <span className="section-meta">Fresh uploads</span>
        </div>
        {loadingSubs && <div className="loading">Loading subscriptions...</div>}
        {!loadingSubs && subsFeed.length === 0 && (
          <div className="error">No subscription videos yet</div>
        )}
        <div className="rail">
          {subsFeed.map(video => (
            <div key={video._id} className="rail-item">
              <VideoCard media={video} compact />
            </div>
          ))}
        </div>
      </section>

      <section className="section" ref={historyRef}>
        <div className="section-header">
          <h2>Watch history</h2>
          <span className="section-meta">Recently watched</span>
        </div>
        {loadingHistory && <div className="loading">Loading history...</div>}
        {!loadingHistory && history.length === 0 && <div className="error">No history yet</div>}
        <div className="rail">
          {history.map(item => {
            const video = item.media || item;
            return (
              <div key={video._id} className="rail-item">
                <VideoCard media={video} compact />
              </div>
            );
          })}
        </div>
      </section>
      </div>
    </div>
  );
}

export default Home;