import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from '@mui/material';
import {
  Home,
  OndemandVideo,
  TrendingUp,
  Subscriptions,
  History,
  Favorite,
  VideoCall,
  Settings,
} from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Browse', icon: <OndemandVideo />, path: '/videos' },
    { text: 'Trending', icon: <TrendingUp />, path: '/trending' },
    { text: 'Subscriptions', icon: <Subscriptions />, path: '/subscriptions' },
    { text: 'History', icon: <History />, path: '/history' },
    { text: 'Liked Videos', icon: <Favorite />, path: '/liked' },
    { text: 'Upload', icon: <VideoCall />, path: '/upload' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: open ? 'block' : 'none',
        },
      }}
      open={open}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              component={Link}
              to={item.path}
              button
              selected={location.pathname === item.path}
              onClick={onClose}
              sx={{
                mb: 0.5,
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;