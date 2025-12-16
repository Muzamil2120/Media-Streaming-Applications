import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import './Navbar.css';

const getAvatar = (u) => {
  if (u && u.avatar) return u.avatar;
  const name = (u && (u.username || u.name || 'User')) || 'User';
  const initials = name.trim().slice(0, 2).toUpperCase();
  const bg = '4A6CF7'; // blue
  const text = 'FFFFFF';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bg}&color=${text}&size=64`;
};

function Navbar({ onToggleTheme, themeMode }) {
  const { user, logout, loading } = useAuth(); // Add loading state
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [usersOpen, setUsersOpen] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError('');
      try {
        const usersData = await userAPI.getAllUsers();
        console.log('🔍 Users API Response:', usersData);
        
        if (mounted) {
          // Handle both array and object with users property
          let usersArray = [];
          if (Array.isArray(usersData)) {
            usersArray = usersData;
          } else if (usersData && usersData.users && Array.isArray(usersData.users)) {
            usersArray = usersData.users;
          } else {
            console.error('❌ Unexpected response format:', usersData);
            setUsersError('Invalid data format from server');
          }
          
          setUsers(usersArray.slice(0, 20));
        }
      } catch (err) {
        if (mounted) {
          console.error('❌ Failed to load users:', err);
          setUsersError(err.message || 'Failed to load users');
          setUsers([]);
        }
      } finally {
        if (mounted) setUsersLoading(false);
      }
    };

    fetchUsers();
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            🎬 MERN Mediastream
          </Link>
          <div className="loading-indicator">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🎬 MERN Mediastream
        </Link>
        {user && <input type="hidden" value={user._id || user.id || ''} aria-hidden="true" />}
        
        <div className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/media" className="nav-link">Videos</Link>
          <Link to="/explore" className="nav-link">Explore</Link>
          <Link to="/subscriptions" className="nav-link">Subscriptions</Link>
          <Link to="/history" className="nav-link">History</Link>
          <Link to="/watch-later" className="nav-link">Watch Later</Link>
          
          {user ? (
            <>
              <Link to="/upload" className="nav-link upload-btn">Upload</Link>
              <Link to="/my-uploads" className="nav-link">My Uploads</Link>
              <div className="nav-dropdown">
                <button className="nav-user-chip" onClick={() => setUsersOpen(false)}>
                  <img
                    src={getAvatar(user)}
                    alt="avatar"
                    className="nav-user-avatar"
                  />
                  <span>{user.username || user.name || 'User'}</span>
                </button>
                <div className="dropdown-content">
                  <Link to={`/profile/${user._id || user.id}`}>Profile</Link>
                  <Link to="/profile/edit">Edit Profile</Link>
                  <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/signup" className="nav-link">Sign Up</Link>
              <Link to="/signin" state={{ from: '/media/new' }} className="nav-link">Sign In</Link>
            </>
          )}

          <div className="nav-users">
            <button className="nav-link" onClick={() => setUsersOpen(!usersOpen)}>Switch Account</button>
            {usersOpen && (
              <div className="users-dropdown">
                {usersLoading && <div className="users-item">Loading users...</div>}
                {usersError && <div className="users-item error">{usersError}</div>}
                {!usersLoading && !usersError && users.length === 0 && (
                  <div className="users-item">No users found</div>
                )}
                {!usersLoading && !usersError && users.map(u => (
                  <div 
                    key={u._id} 
                    className="users-item" 
                    onClick={() => { 
                      setUsersOpen(false); 
                      navigate(`/profile/${u._id}`);
                    }}
                  >
                    <img 
                      src={getAvatar(u)} 
                      alt="avatar" 
                      className="user-mini-avatar" 
                    /> 
                    {u.username || u.name || 'Unknown'}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="nav-link" onClick={onToggleTheme}>
            {themeMode === 'light' ? 'Dark' : 'Light'} mode
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;