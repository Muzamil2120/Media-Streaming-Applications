import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  InputBase,
  alpha,
  styled,
  Button,
  Tooltip,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  VideoCall as UploadIcon,
  AccountCircle,
  DarkMode,
  LightMode,
  YouTube,
  TrendingUp,
  Subscriptions,
  History,
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 50,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '400px',
      '&:focus': {
        width: '500px',
      },
    },
  },
}));

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleUpload = () => {
    navigate('/upload');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(10px)',
        zIndex: 1200,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <IconButton
              color="inherit"
              onClick={onMenuClick}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <Box 
              component={Link} 
              to="/" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <YouTube sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #FF0000 30%, #FF8E53 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                MediaStream
              </Typography>
            </Box>
          </Box>

          {/* Search Bar */}
          <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1 }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search videos, channels, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
          </Box>

          {/* Right Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            {/* Theme Toggle */}
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'light' ? <DarkMode /> : <LightMode />}
              </IconButton>
            </Tooltip>

            {/* Upload Button */}
            <Tooltip title="Upload video">
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handleUpload}
                sx={{
                  borderRadius: 20,
                  px: 3,
                  py: 1,
                  display: { xs: 'none', sm: 'flex' },
                }}
              >
                Upload
              </Button>
            </Tooltip>

            {/* Mobile Upload */}
            <IconButton
              color="primary"
              onClick={handleUpload}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <UploadIcon />
            </IconButton>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={5} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Profile */}
            <Tooltip title="Account">
              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
                <Avatar
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: 'primary.main',
                    border: '2px solid',
                    borderColor: 'primary.light',
                  }}
                  alt={user?.name || 'User'}
                  src={user?.avatar}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { 
                width: 250, 
                mt: 1.5,
                borderRadius: 2,
                boxShadow: 4,
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
              <AccountCircle sx={{ mr: 2 }} />
              Your Channel
            </MenuItem>
            <MenuItem component={Link} to="/dashboard" onClick={handleMenuClose}>
              <TrendingUp sx={{ mr: 2 }} />
              Dashboard
            </MenuItem>
            <MenuItem component={Link} to="/subscriptions" onClick={handleMenuClose}>
              <Subscriptions sx={{ mr: 2 }} />
              Subscriptions
            </MenuItem>
            <MenuItem component={Link} to="/history" onClick={handleMenuClose}>
              <History sx={{ mr: 2 }} />
              History
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>Studio</MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;