
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  Person,
  Security,
  Notifications,
  Storage,
  Palette,
  Info,
  Save,
  RestartAlt
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Settings state
  const [profileSettings, setProfileSettings] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [systemSettings, setSystemSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    maxLogsPerPage: 50,
    enableNotifications: true,
    enableDarkMode: false,
    logRetentionDays: 30,
    enableExport: true
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileChange = (field, value) => {
    setProfileSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSystemChange = (field, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    // Validation
    if (profileSettings.newPassword && profileSettings.newPassword !== profileSettings.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    // Simulation de sauvegarde
    setSuccess('Profil mis à jour avec succès');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSaveSystem = () => {
    // Simulation de sauvegarde
    setSuccess('Paramètres système mis à jour avec succès');
    setTimeout(() => setSuccess(''), 3000);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold" color="#2d3748">
          Paramètres
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={0.5}>
          Configuration du système et préférences utilisateur
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Navigation */}
        <Grid item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <List sx={{ p: 0 }}>
                <ListItemButton
                  selected={activeTab === 0}
                  onClick={() => setActiveTab(0)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#e91e6315',
                      borderRight: '3px solid #e91e63'
                    }
                  }}
                >
                  <ListItemIcon>
                    <Person color={activeTab === 0 ? 'primary' : 'action'} />
                  </ListItemIcon>
                  <ListItemText primary="Profil" />
                </ListItemButton>

                <ListItemButton
                  selected={activeTab === 1}
                  onClick={() => setActiveTab(1)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#e91e6315',
                      borderRight: '3px solid #e91e63'
                    }
                  }}
                >
                  <ListItemIcon>
                    <Storage color={activeTab === 1 ? 'primary' : 'action'} />
                  </ListItemIcon>
                  <ListItemText primary="Système" />
                </ListItemButton>

                <ListItemButton
                  selected={activeTab === 2}
                  onClick={() => setActiveTab(2)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#e91e6315',
                      borderRight: '3px solid #e91e63'
                    }
                  }}
                >
                  <ListItemIcon>
                    <Notifications color={activeTab === 2 ? 'primary' : 'action'} />
                  </ListItemIcon>
                  <ListItemText primary="Notifications" />
                </ListItemButton>

                <ListItemButton
                  selected={activeTab === 3}
                  onClick={() => setActiveTab(3)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#e91e6315',
                      borderRight: '3px solid #e91e63'
                    }
                  }}
                >
                  <ListItemIcon>
                    <Info color={activeTab === 3 ? 'primary' : 'action'} />
                  </ListItemIcon>
                  <ListItemText primary="À propos" />
                </ListItemButton>
              </List>
            </Card>
          </motion.div>
        </Grid>

        {/* Content */}
        <Grid item xs={12} md={9}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent sx={{ p: 0 }}>
                {/* Profile Tab */}
                <TabPanel value={activeTab} index={0}>
                  <Box sx={{ px: 3 }}>
                    <Typography variant="h6" fontWeight="600" mb={3}>
                      Informations du profil
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={profileSettings.email}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    <Typography variant="h6" fontWeight="600" mb={3}>
                      Changer le mot de passe
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Mot de passe actuel"
                          type="password"
                          value={profileSettings.currentPassword}
                          onChange={(e) => handleProfileChange('currentPassword', e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Nouveau mot de passe"
                          type="password"
                          value={profileSettings.newPassword}
                          onChange={(e) => handleProfileChange('newPassword', e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Confirmer le mot de passe"
                          type="password"
                          value={profileSettings.confirmPassword}
                          onChange={(e) => handleProfileChange('confirmPassword', e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>

                    <Box mt={4}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSaveProfile}
                        sx={{
                          background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #c2185b, #7b1fa2)',
                          }
                        }}
                      >
                        Sauvegarder le profil
                      </Button>
                    </Box>
                  </Box>
                </TabPanel>

                {/* System Tab */}
                <TabPanel value={activeTab} index={1}>
                  <Box sx={{ px: 3 }}>
                    <Typography variant="h6" fontWeight="600" mb={3}>
                      Configuration système
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Paper sx={{ p: 3, backgroundColor: '#f8f9ff' }}>
                          <Typography variant="subtitle1" fontWeight="600" mb={2}>
                            Affichage des logs
                          </Typography>
                          
                          <Box mb={3}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={systemSettings.autoRefresh}
                                  onChange={(e) => handleSystemChange('autoRefresh', e.target.checked)}
                                  color="primary"
                                />
                              }
                              label="Actualisation automatique"
                            />
                          </Box>

                          <Grid container spacing={2} mb={3}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Intervalle d'actualisation (secondes)"
                                type="number"
                                value={systemSettings.refreshInterval}
                                onChange={(e) => handleSystemChange('refreshInterval', parseInt(e.target.value))}
                                disabled={!systemSettings.autoRefresh}
                                variant="outlined"
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Logs par page"
                                type="number"
                                value={systemSettings.maxLogsPerPage}
                                onChange={(e) => handleSystemChange('maxLogsPerPage', parseInt(e.target.value))}
                                variant="outlined"
                                size="small"
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>

                      <Grid item xs={12}>
                        <Paper sx={{ p: 3, backgroundColor: '#f8f9ff' }}>
                          <Typography variant="subtitle1" fontWeight="600" mb={2}>
                            Stockage et rétention
                          </Typography>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Rétention des logs (jours)"
                                type="number"
                                value={systemSettings.logRetentionDays}
                                onChange={(e) => handleSystemChange('logRetentionDays', parseInt(e.target.value))}
                                variant="outlined"
                                size="small"
                              />
                            </Grid>
                          </Grid>

                          <Box mt={2}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={systemSettings.enableExport}
                                  onChange={(e) => handleSystemChange('enableExport', e.target.checked)}
                                  color="primary"
                                />
                              }
                              label="Autoriser l'export des logs"
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Box mt={4}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSaveSystem}
                        sx={{
                          background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #c2185b, #7b1fa2)',
                          },
                          mr: 2
                        }}
                      >
                        Sauvegarder
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<RestartAlt />}
                        color="error"
                      >
                        Redémarrer le service
                      </Button>
                    </Box>
                  </Box>
                </TabPanel>

                {/* Notifications Tab */}
                <TabPanel value={activeTab} index={2}>
                  <Box sx={{ px: 3 }}>
                    <Typography variant="h6" fontWeight="600" mb={3}>
                      Préférences de notification
                    </Typography>

                    <Paper sx={{ p: 3, backgroundColor: '#f8f9ff' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.enableNotifications}
                            onChange={(e) => handleSystemChange('enableNotifications', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Activer les notifications"
                      />

                      <Typography variant="body2" color="text.secondary" mt={1} mb={3}>
                        Recevoir des notifications pour les erreurs critiques et les alertes système
                      </Typography>

                      <Divider sx={{ my: 3 }} />

                      <Typography variant="subtitle1" fontWeight="600" mb={2}>
                        Types de notifications
                      </Typography>

                      <Box sx={{ ml: 2 }}>
                        <FormControlLabel
                          control={<Switch defaultChecked color="primary" />}
                          label="Erreurs critiques"
                        />
                        <FormControlLabel
                          control={<Switch defaultChecked color="primary" />}
                          label="Avertissements système"
                        />
                        <FormControlLabel
                          control={<Switch color="primary" />}
                          label="Informations de debug"
                        />
                      </Box>
                    </Paper>

                    <Box mt={4}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        sx={{
                          background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #c2185b, #7b1fa2)',
                          }
                        }}
                      >
                        Sauvegarder les notifications
                      </Button>
                    </Box>
                  </Box>
                </TabPanel>

                {/* About Tab */}
                <TabPanel value={activeTab} index={3}>
                  <Box sx={{ px: 3 }}>
                    <Typography variant="h6" fontWeight="600" mb={3}>
                      À propos de Log Monitor
                    </Typography>

                    <Paper sx={{ p: 3, backgroundColor: '#f8f9ff' }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Version
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            1.0.0
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Dernière mise à jour
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            27 Janvier 2025
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Développé avec
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            React 18 + Symfony 7.3
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Base de données
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            MySQL 8.0
                          </Typography>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 3 }} />

                      <Typography variant="body2" color="text.secondary">
                        Log Monitor est un système de surveillance des journaux d'application 
                        conçu pour faciliter le diagnostic et la résolution des problèmes. 
                        Il offre une interface intuitive pour consulter, filtrer et analyser 
                        les logs en temps réel.
                      </Typography>
                    </Paper>
                  </Box>
                </TabPanel>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;