import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Badge,
  Tooltip,
  Divider,
  ListItemIcon,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Settings,
  Logout,
  Person,
  Dashboard,
  History,
  Help,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser, logout, userProfile } = useAuth();
  const { mode, toggleTheme } = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenu = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/');
  };

  const handleNavigation = (path) => {
    handleClose();
    navigate(path);
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 700,
            color: theme.palette.primary.main
          }}
          onClick={() => navigate('/dashboard')}
        >
          AI Resume Analyzer
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationMenu}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleCloseNotifications}
            PaperProps={{
              sx: { width: 320, maxHeight: 400 }
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Notifications
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleCloseNotifications}>
              <Box sx={{ py: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  Analysis Complete
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Your resume analysis is ready to view
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button fullWidth size="small" onClick={() => navigate('/notifications')}>
                View All
              </Button>
            </Box>
          </Menu>

          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{ ml: 1 }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: theme.palette.primary.main
                }}
              >
                {currentUser?.displayName?.charAt(0) || 
                 userProfile?.name?.charAt(0) || 
                 currentUser?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: { width: 240 }
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" noWrap>
                {currentUser?.displayName || userProfile?.name || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {currentUser?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => handleNavigation('/dashboard')}>
              <ListItemIcon>
                <Dashboard fontSize="small" />
              </ListItemIcon>
              Dashboard
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/history')}>
              <ListItemIcon>
                <History fontSize="small" />
              </ListItemIcon>
              History
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/profile')}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/settings')}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleNavigation('/help')}>
              <ListItemIcon>
                <Help fontSize="small" />
              </ListItemIcon>
              Help & Support
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}