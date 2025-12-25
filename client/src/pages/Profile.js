import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import VideoCard from '../components/VideoCard';
import './Profile.css';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { id: rawId } = useParams();
  const routeId = rawId && rawId !== 'undefined' ? rawId : undefined;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: authUser } = useAuth();

  useEffect(() => {
    let mounted = true;

    if (!routeId && !authUser) {
      // wait for auth to resolve before deciding
      return () => { mounted = false; };
    }

    // If no id param, try to show current user's profile
    const targetId = routeId || (authUser && (authUser.id || authUser._id));
    if (!targetId) {
      // Not signed in and no id: redirect to signin
      setLoading(false);
      navigate('/signin', { state: { from: '/profile' } });
      return () => { mounted = false; };
    }

    setLoading(true);
    userAPI.getUserProfile(targetId)
      .then(res => {
        if (!mounted) return;
        const fetched = res.user || res;
        setUser(fetched);
        const subscriberList = fetched.subscribers || fetched.subscribedBy || [];
        const currentId = authUser && (authUser.id || authUser._id);
        setSubscribed(subscriberList.some((u) => (u._id || u.id || u).toString() === (currentId || '').toString()));
        setLoading(false);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err.message || 'Failed to load user');
        setLoading(false);
      });

    userAPI.getUserUploads(targetId)
      .then(res => { if (mounted) setUploads(res.uploads || res.media || res || []); })
      .catch(() => {});

    return () => { mounted = false; };
  }, [routeId, authUser, navigate]);

  const handleSubscribe = () => {
    const targetId = routeId || (user && (user._id || user.id));
    userAPI.subscribe(targetId).then(() => setSubscribed(true)).catch(() => {});
  };
  const handleUnsubscribe = () => {
    const targetId = routeId || (user && (user._id || user.id));
    userAPI.unsubscribe(targetId).then(() => setSubscribed(false)).catch(() => {});
  };

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!user) return <div className="profile-error">User not found</div>;

  const isOwner = authUser && (authUser.id === user._id || authUser.id === user.id || authUser._id === user._id);
  const displayName = user.name || user.username || 'User';
  const subscriberCount = (user.subscribers && user.subscribers.length) || user.subscribersCount || 0;

  return (
    <div className="profile-page">
      {/* Banner Section */}
      <div className="profile-banner" />
      
      {/* Profile Header */}
      <div className="profile-header">
        <img className="profile-avatar" src={user.avatar || '/default-avatar.jpg'} alt={displayName} />
        <div className="profile-info">
          <h2>{displayName} {user.verified && <span className="verified-badge">✓</span>}</h2>
          <div className="profile-meta">
            <span>📊 {subscriberCount} subscribers</span>
            {isOwner ? (
              <a href="/edit-profile" className="edit-profile-btn">Edit Channel</a>
            ) : subscribed ? (
              <button className="unsubscribe-btn" onClick={handleUnsubscribe}>✓ Subscribed</button>
            ) : (
              <button className="subscribe-btn" onClick={handleSubscribe}>Subscribe</button>
            )}
          </div>
          <div className="profile-bio">{user.bio || 'Welcome to my channel!'}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button className="profile-tab active">Videos</button>
        <button className="profile-tab">Playlists</button>
        <button className="profile-tab">About</button>
      </div>

      {/* Content */}
      <div className="profile-content">
        <h3 className="profile-section-title">Videos</h3>
        {uploads.length === 0 ? (
          <div className="no-videos">
            <p>No videos yet</p>
            {isOwner && (
              <a href="/upload" className="upload-link">Upload your first video</a>
            )}
          </div>
        ) : user.isPrivate && !isOwner ? (
          <div className="private-account-note">This account is private. Videos are hidden.</div>
        ) : (
          <div className="profile-uploads-grid">
            {uploads.map(video => (
              <VideoCard key={video._id} media={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;