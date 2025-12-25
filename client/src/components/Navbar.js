import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Logo from './Logo';
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
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

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
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
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
  }, [dropdownRef]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current && recognitionRef.current.stop) {
        recognitionRef.current.stop();
      }
    };
  }, [recognitionRef]);

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
          <Logo />
          <span>Media Streaming</span>
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
                    setShowHistoryModal(true);
                  }}>
                    <HistoryIcon className="icon" />
                    <span>Report history</span>
                  </div>
                  <div className="dropdown-item" onClick={() => {
                    setShowDropdown(false);
                    setShowHelpModal(true);
                  }}>
                    <HelpOutlineIcon className="icon" />
                    <span>Help</span>
                  </div>
                  <div className="dropdown-item" onClick={() => {
                    setShowDropdown(false);
                    setShowFeedbackModal(true);
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

      {/* Help Modal */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="help-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Help & Support</h3>
              <button className="close-btn" onClick={() => setShowHelpModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="modal-content">
              <div className="help-section">
                <h4>Getting Started</h4>
                <ul>
                  <li>Upload your first video by clicking the upload button</li>
                  <li>Add a title, description, and thumbnail</li>
                  <li>Choose visibility (public or private)</li>
                </ul>
              </div>
              <div className="help-section">
                <h4>Video Management</h4>
                <ul>
                  <li>Edit video details anytime from your uploads</li>
                  <li>View analytics and watch time</li>
                  <li>Delete videos from your channel</li>
                </ul>
              </div>
              <div className="help-section">
                <h4>Interaction</h4>
                <ul>
                  <li>Like and comment on videos</li>
                  <li>Subscribe to creators</li>
                  <li>Create playlists to organize content</li>
                </ul>
              </div>
              <div className="help-section">
                <h4>Need More Help?</h4>
                <p>Email us at: <strong>support@mediastreaming.app</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="feedback-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Feedback</h3>
              <button className="close-btn" onClick={() => setShowFeedbackModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              // Save feedback (you can integrate with your backend)
              console.log('Feedback:', feedbackText);
              alert('Thank you for your feedback!');
              setFeedbackText('');
              setShowFeedbackModal(false);
            }} className="feedback-form">
              <textarea 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you think about our platform..."
                rows="6"
              />
              <div className="feedback-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setFeedbackText('');
                  setShowFeedbackModal(false);
                }}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <SendIcon /> Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="history-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Report History</h3>
              <button className="close-btn" onClick={() => setShowHistoryModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="modal-content">
              <div className="history-section">
                <h4>Reported Issues</h4>
                <div className="history-list">
                  <div className="history-item">
                    <span className="history-status resolved">Resolved</span>
                    <span className="history-text">Video playback issue - 2025-12-20</span>
                  </div>
                  <div className="history-item">
                    <span className="history-status pending">Pending</span>
                    <span className="history-text">Upload speed improvement - 2025-12-18</span>
                  </div>
                  <div className="history-item">
                    <span className="history-status resolved">Resolved</span>
                    <span className="history-text">Comment moderation issue - 2025-12-15</span>
                  </div>
                </div>
              </div>
              <div className="history-section">
                <h4>New Report</h4>
                <button className="btn-primary" onClick={() => {
                  setShowHistoryModal(false);
                  alert('Report form would open here');
                }}>
                  Report an Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;