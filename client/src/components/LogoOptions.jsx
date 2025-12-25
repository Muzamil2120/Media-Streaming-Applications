import React from 'react';

/**
 * Alternative Modern Logo Options
 * Uncomment any of these in Logo.jsx to use different styles
 */

// Option 1: Minimalist Play + Waves
export const MinimalistLogo = () => (
  <svg
    className="media-streaming-logo"
    viewBox="0 0 64 64"
    width="40"
    height="40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#667eea' }} />
        <stop offset="100%" style={{ stopColor: '#764ba2' }} />
      </linearGradient>
    </defs>
    <polygon points="20,20 20,44 44,32" fill="url(#grad1)" />
    <path d="M 48 32 Q 50 28 52 32 Q 50 36 48 32" fill="none" stroke="url(#grad1)" strokeWidth="2" />
    <path d="M 50 28 Q 53 20 56 28 Q 53 36 50 28" fill="none" stroke="url(#grad1)" strokeWidth="1.5" opacity="0.6" />
  </svg>
);

// Option 2: Film Reel
export const FilmReelLogo = () => (
  <svg
    className="media-streaming-logo"
    viewBox="0 0 64 64"
    width="40"
    height="40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#667eea' }} />
        <stop offset="100%" style={{ stopColor: '#764ba2' }} />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="none" stroke="url(#grad2)" strokeWidth="2" />
    <circle cx="32" cy="32" r="20" fill="none" stroke="url(#grad2)" strokeWidth="1.5" />
    <circle cx="32" cy="32" r="12" fill="url(#grad2)" opacity="0.3" />
    <polygon points="28,29 28,35 35,32" fill="url(#grad2)" />
  </svg>
);

// Option 3: Modern Streaming (Recommended - Current)
export const StreamingLogo = () => (
  <svg
    className="media-streaming-logo"
    viewBox="0 0 64 64"
    width="40"
    height="40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#667eea' }} />
        <stop offset="100%" style={{ stopColor: '#764ba2' }} />
      </linearGradient>
    </defs>
    <rect x="12" y="16" width="16" height="12" fill="none" stroke="url(#grad3)" strokeWidth="1.5" rx="1" />
    <polygon points="16,18 16,26 24,22" fill="url(#grad3)" />
    <circle cx="40" cy="22" r="8" fill="none" stroke="url(#grad3)" strokeWidth="1.5" />
    <polygon points="37,19 37,25 44,22" fill="url(#grad3)" />
    <path d="M 12 32 Q 20 36 32 36 Q 44 36 52 32" fill="none" stroke="url(#grad3)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Option 4: Camera + Play
export const CameraPlayLogo = () => (
  <svg
    className="media-streaming-logo"
    viewBox="0 0 64 64"
    width="40"
    height="40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#667eea' }} />
        <stop offset="100%" style={{ stopColor: '#764ba2' }} />
      </linearGradient>
    </defs>
    <polygon points="12,20 22,16 22,28 12,24" fill="url(#grad4)" opacity="0.7" />
    <rect x="18" y="14" width="28" height="22" fill="none" stroke="url(#grad4)" strokeWidth="2" rx="2" />
    <circle cx="32" cy="25" r="6" fill="none" stroke="url(#grad4)" strokeWidth="1.5" />
    <polygon points="29,23 29,27 34,25" fill="url(#grad4)" />
  </svg>
);
