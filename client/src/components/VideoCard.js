import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './VideoCard.css';

const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5002';

function VideoCard({ media, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views;
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const thumbSrc = useMemo(() => {
    if (media.thumbnail) {
      return media.thumbnail.startsWith('http') ? media.thumbnail : `${apiBase}${media.thumbnail}`;
    }
    if (media.filePath) {
      return media.filePath.startsWith('http') ? media.filePath : `${apiBase}${media.filePath}`;
    }
    return '/placeholder.jpg';
  }, [media]);

  return (
    <div className="video-card">
      <Link to={`/media/play/${media._id}`} className="video-thumb-wrap">
        <img 
          src={thumbSrc} 
          alt={media.title}
        />
        <span className="video-duration">{media.duration || '0:00'}</span>
      </Link>

      <div className="video-content">
        <Link to={`/profile/${media.uploader._id}`} className="channel-avatar">
          <img 
            src={media.uploader.avatar || '/default-avatar.jpg'} 
            alt={media.uploader.name}
          />
        </Link>

        <div className="video-details">
          <Link to={`/media/play/${media._id}`} className="video-title">
            {media.title}
          </Link>

          <Link to={`/profile/${media.uploader._id}`} className="channel-name">
            {media.uploader.name}
            {media.uploader.verified && <span className="verified-badge">✓</span>}
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
            const isOwner = currentUser && (currentUser._id === media.uploader._id || currentUser.id === media.uploader._id);
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
        <div className="duration">{media.duration || ''}</div>
      </div>
    </div>
  );
}

export default VideoCard;
