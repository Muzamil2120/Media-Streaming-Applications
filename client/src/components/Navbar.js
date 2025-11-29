import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  // Check if user is logged in (mock authentication)
  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🎬 MERN Mediastream
        </Link>
        
        <div className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/media" className="nav-link">Videos</Link>
          
          {user ? (
            <>
              <Link to="/media/new" className="nav-link">Upload</Link>
              <div className="nav-dropdown">
                <span className="nav-user">👤 {user.name}</span>
                <div className="dropdown-content">
                  <Link to="/profile">Profile</Link>
                  <Link to="/profile/edit">Edit Profile</Link>
                  <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/signup" className="nav-link">Sign Up</Link>
              <Link to="/signin" className="nav-link">Sign In</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;