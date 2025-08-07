import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as LogsIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  MonitorHeart,
  ChevronLeft,
  AdminPanelSettings
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Sidebar = ({ open, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      color: '#e91e63'
    },
    {
      text: 'Logs',
      icon: <LogsIcon />,
      path: '/logs',
      color: '#9c27b0'
    },
    {
      text: 'Utilisateurs',
      icon: <UsersIcon />,
      path: '/users',
      color: '#3f51b5',
      adminOnly: true
    },
    {
      text: 'Paramètres',
      icon: <SettingsIcon />,
      path: '/settings',
      color: '#607d8b'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerWidth = open ? 280 : 80;

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #fff 0%, #f8f9ff 100%)',
          borderRight: '1px solid #e2e8f0',
          transition: 'width 0.3s ease',
          overflowX: 'hidden'
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64,
          background: 'linear-gradient(135deg, #e91e63 0%, #9c27b0 100%)',
          color: 'white'
        }}
      >
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <MonitorHeart fontSize="large" />
            <Typography variant="h6" fontWeight="bold">
              Log Monitor
            </Typography>
          </motion.div>
        )}
        
        {!open && (
          <Box display="flex" justifyContent="center" width="100%">
            <MonitorHeart fontSize="large" />
          </Box>
        )}
        
        {open && (
          <IconButton 
            onClick={onToggle}
            sx={{ color: 'white' }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: open ? 48 : 40,
              height: open ? 48 : 40,
              background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
              fontSize: open ? '1.2rem' : '1rem'
            }}
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Typography variant="subtitle2" fontWeight="600" noWrap>
                {user?.email || 'Utilisateur'}
              </Typography>
              <Box display="flex" gap={1} mt={0.5}>
                {isAdmin() && (
                  <Chip
                    icon={<AdminPanelSettings />}
                    label="Admin"
                    size="small"
                    sx={{
                      background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                )}
                <Chip
                  label="En ligne"
                  size="small"
                  sx={{
                    bgcolor: '#4caf50',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
              </Box>
            </motion.div>
          )}
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, py: 1 }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item, index) => {
            if (item.adminOnly && !isAdmin()) {
              return null;
            }

            const isActive = location.pathname === item.path;
            
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <Tooltip 
                    title={!open ? item.text : ''} 
                    placement="right"
                    arrow
                  >
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                        borderRadius: 2,
                        mx: 1,
                        background: isActive 
                          ? `linear-gradient(45deg, ${item.color}15, ${item.color}10)`
                          : 'transparent',
                        border: isActive ? `2px solid ${item.color}30` : '2px solid transparent',
                        '&:hover': {
                          background: `linear-gradient(45deg, ${item.color}20, ${item.color}15)`,
                          transform: 'translateX(4px)',
                        },
                        transition: 'all 0.3s ease',
                        justifyContent: open ? 'initial' : 'center',
                        px: open ? 2 : 0
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: open ? 40 : 'unset',
                          color: isActive ? item.color : '#718096',
                          transition: 'color 0.3s ease'
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      
                      {open && (
                        <ListItemText
                          primary={item.text}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.95rem',
                              fontWeight: 500,
                              color: isActive ? item.color : '#2d3748'
                            }
                          }}
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              </motion.div>
            );
          })}
        </List>
        
        <Divider sx={{ my: 2, mx: 2 }} />
        
        {/* Logout Button */}
        <List sx={{ px: 1 }}>
          <ListItem disablePadding>
            <Tooltip 
              title={!open ? 'Déconnexion' : ''} 
              placement="right"
              arrow
            >
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  color: '#e53e3e',
                  '&:hover': {
                    backgroundColor: '#fed7d7',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.3s ease',
                  justifyContent: open ? 'initial' : 'center',
                  px: open ? 2 : 0
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: open ? 40 : 'unset',
                    color: '#e53e3e'
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                
                {open && (
                  <ListItemText
                    primary="Déconnexion"
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        color: '#e53e3e'
                      }
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
