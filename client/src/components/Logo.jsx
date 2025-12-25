import React from 'react';
import './Logo.css';

const Logo = () => {
  return (
    <svg
      className="media-streaming-logo"
      viewBox="0 0 64 64"
      width="40"
      height="40"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="32" cy="32" r="30" fill="url(#logoGradient)" opacity="0.15" />

      {/* Play button (main symbol) */}
      <g transform="translate(32, 32)">
        {/* Left video frame */}
        <rect x="-20" y="-14" width="14" height="12" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5" rx="2" />
        <polygon points="-16,-11 -16,-5 -13,-8" fill="url(#logoGradient)" />

        {/* Center play icon */}
        <circle cx="0" cy="0" r="10" fill="none" stroke="url(#logoGradient)" strokeWidth="2" />
        <polygon points="-4,-6 -4,6 6,0" fill="url(#logoGradient)" />

        {/* Right video frame */}
        <rect x="6" y="-14" width="14" height="12" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5" rx="2" />
        <polygon points="10,-11 10,-5 13,-8" fill="url(#logoGradient)" />

        {/* Bottom wave (representing streaming) */}
        <path
          d="M -15 12 Q -10 14 -5 12 T 5 12 T 15 12"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* Glow effect dots */}
      <circle cx="15" cy="15" r="2" fill="#667eea" opacity="0.5" />
      <circle cx="49" cy="49" r="2" fill="#764ba2" opacity="0.5" />
    </svg>
  );
};

export default Logo;
