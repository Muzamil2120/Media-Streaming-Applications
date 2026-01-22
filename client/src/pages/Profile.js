import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mediaAPI, userAPI } from '../services/api';
import VideoCard from '../components/VideoCard';
import './Profile.css';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { id: rawId } = useParams();
  const routeId = rawId && rawId !== 'undefined' ? rawId : undefined;
  const navigate = useNavigate();
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5002';
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingSub, setSubmittingSub] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const { user: authUser } = useAuth();

  const normalizeImageUrl = (raw) => {
    if (!raw || typeof raw !== 'string') return '';
    if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
    if (raw.startsWith('//')) return `https:${raw}`;
    if (raw.startsWith('http')) return raw;
    return `${apiBase}${raw}`;
  };

  const computeSubscribed = useCallback((fetchedUser) => {
    const subscriberList = fetchedUser?.subscribers || fetchedUser?.subscribedBy || [];
    const currentId = authUser && (authUser.id || authUser._id);
    return subscriberList.some((u) => (u?._id || u?.id || u).toString() === (currentId || '').toString());
  }, [authUser]);

  const loadProfile = useCallback(async (targetId, { loadUploads = true } = {}) => {
    const res = await userAPI.getUserProfile(targetId);
    const fetched = res.user || res;
    setUser(fetched);
    setSubscribed(computeSubscribed(fetched));

    if (loadUploads) {
      try {
        const uploadsRes = await userAPI.getUserUploads(targetId);
        setUploads(uploadsRes.uploads || uploadsRes.media || uploadsRes || []);
      } catch {
        // ignore uploads load errors here; page still usable
      }
    }
  }, [computeSubscribed]);

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
    (async () => {
      try {
        await loadProfile(targetId, { loadUploads: true });
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Failed to load user');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [routeId, authUser, navigate, loadProfile]);

  const handleSubscribeToggle = async () => {
    const targetId = routeId || (user && (user._id || user.id));
    if (!targetId) return;
    try {
      setError('');
      setSubmittingSub(true);

      if (subscribed) {
        await userAPI.unsubscribe(targetId);
      } else {
        await userAPI.subscribe(targetId);
      }

      await loadProfile(targetId, { loadUploads: false });
    } catch (err) {
      setError(err.message || 'Subscription action failed');
    } finally {
      setSubmittingSub(false);
    }
  };

  const handleDelete = async (mediaId) => {
    if (!mediaId) return;
    const ok = window.confirm('Delete this video? This cannot be undone.');
    if (!ok) return;

    try {
      setError('');
      setDeletingId(mediaId);
      await mediaAPI.deleteMedia(mediaId);
      setUploads((prev) => prev.filter((v) => v && v._id !== mediaId));
    } catch (err) {
      setError(err.message || 'Failed to delete video');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!user) return <div className="profile-error">User not found</div>;

  const authId = authUser && (authUser.id || authUser._id);
  const profileId = user && (user._id || user.id);
  const isOwner = authId && profileId && String(authId) === String(profileId);
  const displayName = user.name || user.username || 'User';
  const subscriberCount = (user.subscribers && user.subscribers.length) || user.subscribersCount || 0;
  const avatarSrc = normalizeImageUrl(user.avatar) || '/placeholder.svg';

  return (
    <div className="profile-page">
      {/* Banner Section */}
      <div className="profile-banner" />
      
      {/* Profile Header */}
      <div className="profile-header">
        <img className="profile-avatar" src={avatarSrc} alt={displayName} />
        <div className="profile-info">
          <h2>{displayName} {user.verified && <span className="verified-badge">✓</span>}</h2>
          <div className="profile-meta">
            <span>📊 {subscriberCount} subscribers</span>
            {isOwner ? (
              <a href="/edit-profile" className="edit-profile-btn">Edit Channel</a>
            ) : !authUser ? (
              <button className="subscribe-btn" onClick={() => navigate('/signin', { state: { from: `/profile/${user._id || user.id}` } })}>
                Sign in to Subscribe
              </button>
            ) : subscribed ? (
                <button className="unsubscribe-btn" disabled={submittingSub} onClick={handleSubscribeToggle}>✓ Subscribed</button>
            ) : (
                <button className="subscribe-btn" disabled={submittingSub} onClick={handleSubscribeToggle}>Subscribe</button>
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
              <VideoCard key={video._id} media={video} onDelete={deletingId ? undefined : handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;