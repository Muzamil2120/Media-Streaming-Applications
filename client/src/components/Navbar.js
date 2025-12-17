import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import './Navbar.css';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MicIcon from '@mui/icons-material/Mic';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FeedbackIcon from '@mui/icons-material/Feedback';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const getAvatar = (u) => {
  if (u && u.avatar) return u.avatar;
  const name = (u && (u.username || u.name || 'User')) || 'User';
  const initials = name.trim().slice(0, 2).toUpperCase();
  const bg = '4A6CF7'; // blue
  const text = 'FFFFFF';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bg}&color=${text}&size=64`;
};

function Navbar({ onToggleTheme, themeMode, onToggleSidebar }) {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const dropdownRef = useRef(null);
  const recognitionRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
    }

    const recognition = recognitionRef.current;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      navigate(`/search?q=${encodeURIComponent(transcript)}`);
    };

    recognition.start();
  };

  const handleNotificationsClick = () => {
    alert('Notifications coming soon. You will see alerts here.');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => () => {
    if (recognitionRef.current && recognitionRef.current.stop) {
      recognitionRef.current.stop();
    }
  }, []);

  // Fetch users when modal opens
  useEffect(() => {
    if (showAccountModal) {
      const fetchUsers = async () => {
        setUsersLoading(true);
        try {
          const usersData = await userAPI.getAllUsers();
          let usersArray = [];
          if (Array.isArray(usersData)) {
            usersArray = usersData;
          } else if (usersData && usersData.users && Array.isArray(usersData.users)) {
            usersArray = usersData.users;
          }
          // Filter out current user
          setUsers(usersArray.filter(u => u._id !== user?._id).slice(0, 10));
        } catch (err) {
          console.error('Failed to load users:', err);
        } finally {
          setUsersLoading(false);
        }
      };
      fetchUsers();
    }
  }, [showAccountModal, user]);

  if (loading) return null;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="icon-btn menu-btn" onClick={onToggleSidebar} title="Toggle sidebar">
          <MenuIcon />
        </button>
        <Link to="/" className="nav-logo">
          <div className="logo-icon">▶</div>
          <span>YouTube Clone</span>
        </Link>
      </div>

      <div className="nav-center">
        <form className="search-bar" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="search-btn">
            <SearchIcon />
          </button>
        </form>
        <button className={`icon-btn mic-btn ${listening ? 'listening' : ''}`} onClick={handleMicClick} title={listening ? 'Listening...' : 'Voice search'}>
          <MicIcon />
        </button>
      </div>

      <div className="nav-right">
        <button className="icon-btn" onClick={onToggleTheme} title="Toggle Theme">
          {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </button>

        {user ? (
          <>
            <Link to="/upload" className="icon-btn" title="Create">
              <VideoCallIcon />
            </Link>
            <button className="icon-btn" title="Notifications" onClick={handleNotificationsClick}>
              <NotificationsIcon />
            </button>
            <div className="nav-profile" ref={dropdownRef}>
              <img 
                src={getAvatar(user)} 
                alt="Profile" 
                className="nav-avatar"
                onClick={() => setShowDropdown(!showDropdown)}
              />
              
              {showDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <img src={getAvatar(user)} alt="Profile" className="dropdown-avatar" />
                    <div className="dropdown-user-info">
                      <span className="dropdown-name">{user.username || user.name}</span>
                      <span className="dropdown-email">{user.email}</span>
                      <Link
                        to={`/profile/${user._id || user.id}`}
                        className="manage-account-link"
                        onClick={() => setShowDropdown(false)}
                      >
                        View your channel
                      </Link>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" onClick={() => {
                    setShowDropdown(false);
                    setShowAccountModal(true);
                  }}>
                    <SwitchAccountIcon className="icon" />
                    <span>Switch account</span>
                    <KeyboardArrowRightIcon className="arrow-icon" />
                  </div>
                  <div className="dropdown-item" onClick={handleLogout}>
                    <LogoutIcon className="icon" />
                    <span>Sign out</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" onClick={() => {
                    setShowDropdown(false);
                    navigate('/settings');
                  }}>
                    <SettingsIcon className="icon" />
                    <span>Settings</span>
                  </div>
                  <div className="dropdown-item" onClick={() => {
                    setShowDropdown(false);
                    window.open('https://support.google.com/youtube', '_blank');
                  }}>
                    <HelpOutlineIcon className="icon" />
                    <span>Help</span>
                  </div>
                  <div className="dropdown-item" onClick={() => {
                    setShowDropdown(false);
                    window.open('mailto:support@mediastream.app?subject=Feedback', '_blank');
                  }}>
                    <FeedbackIcon className="icon" />
                    <span>Send feedback</span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/signin" className="signin-btn">
            <AccountCircleIcon />
            <span>Sign in</span>
          </Link>
        )}
      </div>

      {/* Switch Account Modal */}
      {showAccountModal && (
        <div className="modal-overlay" onClick={() => setShowAccountModal(false)}>
          <div className="account-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Accounts</h3>
              <button className="close-btn" onClick={() => setShowAccountModal(false)}>×</button>
            </div>
            <div className="account-list">
              <div className="account-item current-account">
                <img src={getAvatar(user)} alt={user.username} className="account-avatar" />
                <div className="account-info">
                  <span className="account-name">{user.username || user.name}</span>
                  <span className="account-email">{user.email}</span>
                </div>
                <div className="current-indicator">✓</div>
              </div>
              
              {usersLoading && <div className="loading-text">Loading accounts...</div>}
              
              {users.map(u => (
                <div 
                  key={u._id} 
                  className="account-item"
                  onClick={() => {
                    setShowAccountModal(false);
                    logout();
                    navigate('/signin', { state: { prefillEmail: u.email, from: '/' } });
                  }}
                >
                  <img src={getAvatar(u)} alt={u.username} className="account-avatar" />
                  <div className="account-info">
                    <span className="account-name">{u.username || u.name}</span>
                    <span className="account-email">{u.email}</span>
                  </div>
                </div>
              ))}

              <div className="account-item add-account" onClick={() => {
                setShowAccountModal(false);
                logout();
                navigate('/signin');
              }}>
                <AddIcon className="icon" />
                <span>Sign in to another account</span>
              </div>
              
              <div className="account-item logout-item" onClick={() => {
                setShowAccountModal(false);
                handleLogout();
              }}>
                <LogoutIcon className="icon" />
                <span>Sign out</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;