import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>🎬 MERN Mediastream</h1>
          <p>Your Professional Media Streaming Platform</p>
          <p>Stream, Upload, and Share Videos Seamlessly</p>
          
          <div className="hero-buttons">
            {user ? (
              <>
                <Link to="/media" className="btn btn-primary">Browse Videos</Link>
                <Link to="/media/new" className="btn btn-secondary">Upload Video</Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary">Get Started</Link>
                <Link to="/media" className="btn btn-secondary">Browse Videos</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2>Why Choose MERN Mediastream?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎥</div>
              <h3>High Quality Streaming</h3>
              <p>Stream videos in HD quality with smooth playback experience</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast Upload</h3>
              <p>Upload your videos quickly and share them with the world</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Platform</h3>
              <p>Your content and data are protected with advanced security</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;