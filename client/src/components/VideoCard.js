import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import './VideoCard.css';

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const INLINE_PLACEHOLDER_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
     <defs>
       <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0" stop-color="#111827"/>
         <stop offset="1" stop-color="#374151"/>
       </linearGradient>
     </defs>
     <rect width="640" height="360" fill="url(#g)"/>
     <circle cx="320" cy="180" r="56" fill="rgba(255,255,255,0.12)"/>
     <polygon points="305,150 305,210 360,180" fill="rgba(255,255,255,0.75)"/>
   </svg>`
)}`;

const makeInitialsAvatar = (name) => {
  const safeName = String(name || '').trim();
  const initials = safeName
    ? safeName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('')
    : 'U';

  const fg = '#f8fafc';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1f2937"/>
        <stop offset="1" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="80" height="80" rx="40" fill="url(#g)"/>
    <text x="40" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="${fg}" font-weight="700">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

function VideoCard({ media, onDelete }) {
  const formatViews = (views) => {
    const v = typeof views === 'number' ? views : Number(views);
    if (!Number.isFinite(v) || v < 0) return 0;
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
    return v;
  };

  const formatDate = (date) => {
    const now = new Date();
    const parsed = new Date(date);
    if (!(parsed instanceof Date) || Number.isNaN(parsed.getTime())) return 'Unknown';
    const diff = now - parsed;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const { uploaderId, uploaderName, uploaderAvatar, uploaderVerified } = useMemo(() => {
    const uploader = media?.uploader;
    const uploaderId =
      (uploader && typeof uploader === 'object' && (uploader._id || uploader.id)) ||
      (typeof uploader === 'string' ? uploader : null);

    const uploaderName =
      (uploader && typeof uploader === 'object' && (uploader.name || uploader.username)) ||
      'Unknown channel';

    const rawAvatar = uploader && typeof uploader === 'object' ? uploader.avatar : null;
    const uploaderAvatar = rawAvatar
      ? rawAvatar.startsWith('data:') || rawAvatar.startsWith('blob:')
        ? rawAvatar
        : rawAvatar.startsWith('//')
          ? `https:${rawAvatar}`
          : rawAvatar.startsWith('http')
            ? rawAvatar
            : `${apiBase}${rawAvatar}`
      : makeInitialsAvatar(uploaderName);

    const uploaderVerified = Boolean(uploader && typeof uploader === 'object' && uploader.verified);

    return { uploaderId, uploaderName, uploaderAvatar, uploaderVerified };
  }, [media]);

  const thumbSrc = useMemo(() => {
    const rawThumb = media?.thumbnail;
    if (rawThumb) {
      if (rawThumb.startsWith('//')) return `https:${rawThumb}`;
      return rawThumb.startsWith('http') ? rawThumb : `${apiBase}${rawThumb}`;
    }
    return INLINE_PLACEHOLDER_SVG;
  }, [media]);

  const safeTitle = typeof media.title === 'string' && media.title.trim() ? media.title : 'Untitled video';
  const safeDuration = typeof media.duration === 'string' ? media.duration : media.duration ? String(media.duration) : '0:00';

  const profileHref = uploaderId ? `/profile/${uploaderId}` : '/profile';
  const playHref = media._id ? `/media/play/${media._id}` : '#';

  return (
    <div className="video-card">
      <Link to={playHref} className="video-thumb-wrap">
        <img 
          src={thumbSrc} 
          alt={safeTitle}
          loading="lazy"
          onError={(e) => {
            // Avoid infinite loop
            if (e.currentTarget.dataset.fallbackApplied) return;
            e.currentTarget.dataset.fallbackApplied = 'true';
            e.currentTarget.src = INLINE_PLACEHOLDER_SVG;
          }}
        />
        <span className="video-duration">{safeDuration}</span>
      </Link>

      <div className="video-content">
        <Link to={profileHref} className="channel-avatar">
          <img 
            src={uploaderAvatar}
            alt={uploaderName}
            loading="lazy"
            onError={(e) => {
              if (e.currentTarget.dataset.fallbackApplied) return;
              e.currentTarget.dataset.fallbackApplied = 'true';
              e.currentTarget.src = INLINE_PLACEHOLDER_SVG;
            }}
          />
        </Link>

        <div className="video-details">
          <Link to={playHref} className="video-title" title={safeTitle}>
            {safeTitle}
          </Link>

          <Link to={profileHref} className="channel-name" title={uploaderName}>
            {uploaderName}
            {uploaderVerified && <span className="verified-badge">✓</span>}
          </Link>

          <div className="video-meta">
            <span className="views">{formatViews(media.views)} views</span>
            <span>•</span>
            <span>{formatDate(media.createdAt)}</span>
          </div>
        </div>

        <div className="video-actions">
          {(() => {
            const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
            const isOwner = currentUser && uploaderId && (currentUser._id === uploaderId || currentUser.id === uploaderId);
            return isOwner ? (
              <>
                <button className="action-btn edit-btn" onClick={() => window.location.href = `/media/edit/${media._id}`} title="Edit">✏️</button>
                <button className="action-btn delete-btn" onClick={() => onDelete && onDelete(media._id)} title="Delete">🗑️</button>
              </>
            ) : null;
          })()}
        </div>
      </div>

      <div className="card-footer">
        <div className="views">{formatViews(media.views)} views</div>
        <div className="duration">{safeDuration === '0:00' ? '' : safeDuration}</div>
      </div>
    </div>
  );
}

export default VideoCard;
