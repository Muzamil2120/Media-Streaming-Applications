import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

// Suppress noisy media play() AbortError rejections during route changes/unmounts.
// This commonly occurs when a video is removed while a play() promise is pending.
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = typeof reason === 'string' ? reason : (reason && reason.message) ? reason.message : '';
  const name = reason && reason.name ? reason.name : '';

  const isMediaAbort =
    name === 'AbortError' ||
    message.includes('play() request was interrupted') ||
    message.includes('media was removed from the document') ||
    message.includes('NotAllowedError') ||
    message.includes('NotSupportedError');

  if (isMediaAbort) {
    event.preventDefault();
  }
});

// Patch HTMLMediaElement.play() to catch errors before they reject
if (typeof HTMLMediaElement !== 'undefined') {
  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function() {
    const playPromise = originalPlay.call(this);
    if (playPromise instanceof Promise) {
      return playPromise.catch((err) => {
        // Silently catch media-related errors (play interrupted, etc)
        if (
          err.name === 'AbortError' ||
          err.message?.includes('play() request was interrupted') ||
          err.message?.includes('media was removed from the document') ||
          err.name === 'NotAllowedError' ||
          err.name === 'NotSupportedError'
        ) {
          // Return resolved promise instead of rejecting
          return Promise.resolve();
        }
        // Re-throw unexpected errors
        throw err;
      });
    }
    return playPromise;
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);