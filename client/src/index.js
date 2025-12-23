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
    message.includes('media was removed from the document');

  if (isMediaAbort) {
    event.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);