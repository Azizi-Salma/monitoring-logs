
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Settings,
  ExitToApp,
  AdminPanelSettings
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const TopBar = ({ onMenuClick }) => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationCount] = React.useState(3); // Exemple de notifications

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  // Titre de la page basé sur la route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/logs':
        return 'Gestion des Logs';
      case '/users':
        return 'Gestion des Utilisateurs';
      case '/settings':
        return 'Paramètres';
      default:
        return 'Log Monitor';
    }
  };

  const getPageSubtitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Vue d\'ensemble du système de monitoring';
      case '/logs':
        return 'Consultation et analyse des fichiers de logs';
      case '/users':
        return 'Administration des comptes utilisateurs';
      case '/settings':
        return 'Configuration du système';
      default:
        return '';
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0',
        color: '#2d3748'
      }}
    >
      <Toolbar sx={{ px: 3, py: 1 }}>
        {/* Menu Button & Page Title */}
        <Box display="flex" alignItems="center" flexGrow={1}>
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{ 
              mr: 2,
              color: '#718096',
              '&:hover': {
                backgroundColor: '#f7fafc',
                color: '#e91e63'
              }
            }}
          >
            <MenuIcon />
          </IconButton>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mr: 1
              }}
            >
              {getPageTitle()}
            </Typography>
            
            {getPageSubtitle() && (
              <Typography
                variant="caption"
                sx={{
                  color: '#718096',
                  display: 'block',
                  lineHeight: 1.2,
                  mt: -0.5
                }}
              >
                {getPageSubtitle()}
              </Typography>
            )}
          </motion.div>
        </Box>

        {/* Right side - Notifications & User Menu */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* Notifications */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              sx={{
                color: '#718096',
                '&:hover': {
                  backgroundColor: '#f7fafc',
                  color: '#e91e63'
                }
              }}
            >
              <Badge badgeContent={notificationCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </motion.div>

          {/* User Info & Menu */}
          <Box display="flex" alignItems="center" gap={2} ml={2}>
            {/* User Status */}
            <Box textAlign="right" sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {user?.email || 'Utilisateur'}
              </Typography>
              <Box display="flex" justifyContent="flex-end" gap={0.5} mt={0.5}>
                {isAdmin() && (
                  <Chip
                    icon={<AdminPanelSettings />}
                    label="Admin"
                    size="small"
                    sx={{
                      background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 18
                    }}
                  />
                )}
                <Chip
                  label="En ligne"
                  size="small"
                  sx={{
                    bgcolor: '#48bb78',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 18
                  }}
                />
              </Box>
            </Box>

            {/* User Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{ p: 0 }}
              >
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
                    border: '2px solid #fff',
                    boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)'
                  }}
                >
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </motion.div>
          </Box>
        </Box>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleUserMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
            }
          }}
        >
          {/* User Info in Menu */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" fontWeight="600">
              {user?.email || 'Utilisateur'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Connecté depuis aujourd'hui
            </Typography>
          </Box>

          {/* Menu Items */}
          <MenuItem onClick={handleUserMenuClose}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mon Profil</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleUserMenuClose}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Paramètres</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem 
            onClick={handleLogout}
            sx={{ 
              color: '#e53e3e',
              '&:hover': {
                backgroundColor: '#fed7d7'
              }
            }}
          >
            <ListItemIcon>
              <ExitToApp fontSize="small" sx={{ color: '#e53e3e' }} />
            </ListItemIcon>
            <ListItemText>Déconnexion</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;