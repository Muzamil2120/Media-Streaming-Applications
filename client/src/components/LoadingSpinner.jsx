import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  const containerStyle = fullScreen
    ? { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.9)', zIndex: 9999 }
    : { display: 'flex', alignItems: 'center', gap: 12 };

  const spinnerStyle = {
    width: fullScreen ? 60 : 40,
    height: fullScreen ? 60 : 40,
    borderRadius: '50%',
    border: '6px solid #f3f3f3',
    borderTop: '6px solid #ff0000',
    animation: 'lds-spin 1s linear infinite',
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle} />
      {message && <div style={{ color: '#666' }}>{message}</div>}
      <style>{`@keyframes lds-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoadingSpinner;