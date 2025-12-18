import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import './Sidebar.css';

// MUI Icons
import HomeIcon from '@mui/icons-material/Home';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import HistoryIcon from '@mui/icons-material/History';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import SettingsIcon from '@mui/icons-material/Settings';
import FlagIcon from '@mui/icons-material/Flag';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';

const getAvatar = (u) => {
  if (u && u.avatar) return u.avatar;
  const name = (u && (u.username || u.name || 'User')) || 'User';
  const initials = name.trim().slice(0, 2).toUpperCase();
  const bg = '4A6CF7'; // blue
  const text = 'FFFFFF';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bg}&color=${text}&size=64`;
};

const Sidebar = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Fetch users for Switch Account
  useEffect(() => {
    if (!showAccountModal) return;
    
    let mounted = true;
    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError('');
      try {
        const usersData = await userAPI.getAllUsers();
        if (mounted) {
          let usersArray = [];
          if (Array.isArray(usersData)) {
            usersArray = usersData;
          } else if (usersData && usersData.users && Array.isArray(usersData.users)) {
            usersArray = usersData.users;
          }
          setUsers(usersArray.slice(0, 20));
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to load users:', err);
          setUsersError('Failed to load users');
        }
      } finally {
        if (mounted) setUsersLoading(false);
      }
    };
    fetchUsers();
    return () => { mounted = false; };
  }, [showAccountModal]);

  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleComingSoon = (label) => {
    window.alert(`${label} coming soon.`);
  };

  return (
    <>
      <aside className={`side-nav ${open ? '' : 'collapsed'}`}>
        <div className="side-nav-section">
          <div className={`side-nav-item ${isActive('/') ? 'active' : ''}`} onClick={() => handleNavClick('/')}>
            <HomeIcon className="icon" /> Home
          </div>
          <div className={`side-nav-item ${isActive('/videos') ? 'active' : ''}`} onClick={() => handleNavClick('/videos')}>
            <SlowMotionVideoIcon className="icon" /> Shorts
          </div>
          <div className={`side-nav-item ${isActive('/subscriptions') ? 'active' : ''}`} onClick={() => handleNavClick('/subscriptions')}>
            <SubscriptionsIcon className="icon" /> Subscriptions
          </div>
        </div>
        <div className="side-nav-divider"></div>
        <div className="side-nav-section">
          <div className="side-nav-title">
            You <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
          </div>
          <div className={`side-nav-item ${isActive('/history') ? 'active' : ''}`} onClick={() => handleNavClick('/history')}>
            <HistoryIcon className="icon" /> History
          </div>
          <div className={`side-nav-item ${isActive('/media') ? 'active' : ''}`} onClick={() => handleNavClick('/media')}>
            <VideoLibraryIcon className="icon" /> Library
          </div>
          <div className={`side-nav-item ${isActive('/my-uploads') ? 'active' : ''}`} onClick={() => handleNavClick('/my-uploads')}>
            <SmartDisplayIcon className="icon" /> Your videos
          </div>
          <div className={`side-nav-item ${isActive('/watch-later') ? 'active' : ''}`} onClick={() => handleNavClick('/watch-later')}>
            <WatchLaterIcon className="icon" /> Watch later
          </div>
          <div className={`side-nav-item ${isActive('/liked') ? 'active' : ''}`} onClick={() => handleNavClick('/liked')}>
            <ThumbUpIcon className="icon" /> Liked videos
          </div>
        </div>
        <div className="side-nav-divider"></div>
        <div className="side-nav-section">
          <div className={`side-nav-item ${isActive('/settings') ? 'active' : ''}`} onClick={() => handleNavClick('/settings')}>
            <SettingsIcon className="icon" /> Settings
          </div>
          <div className="side-nav-item" onClick={() => handleComingSoon('Report history')}>
            <FlagIcon className="icon" /> Report history
          </div>
          <div className="side-nav-item" onClick={() => handleComingSoon('Help')}>
            <HelpOutlineIcon className="icon" /> Help
          </div>
          <div className="side-nav-item" onClick={() => handleComingSoon('Send feedback')}>
            <FeedbackIcon className="icon" /> Send feedback
          </div>
        </div>
        <div className="side-nav-divider"></div>
        <div className="side-nav-section">
          <div className="side-nav-item" onClick={() => setShowAccountModal(true)}>
            <SwitchAccountIcon className="icon" /> Switch account
          </div>
        </div>
      </aside>

      {/* Switch Account Modal */}
      {showAccountModal && (
        <div className="modal-overlay" onClick={() => setShowAccountModal(false)}>
          <div className="account-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Accounts</h3>
              <button className="close-btn" onClick={() => setShowAccountModal(false)}>×</button>
            </div>
            <div className="account-list">
              {usersLoading && <div className="loading-text">Loading accounts...</div>}
              {usersError && <div className="error-text">{usersError}</div>}
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
                <span>Add account</span>
              </div>
              <div className="account-item logout-item" onClick={() => {
                setShowAccountModal(false);
                logout();
                navigate('/signin');
              }}>
                <LogoutIcon className="icon" />
                <span>Sign out</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
