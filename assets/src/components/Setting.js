import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  Save,
  Person,
  Security,
  Notifications,
  Palette,
  Storage,
  Download,
  Upload,
  Refresh,
  Info,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Profil utilisateur
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    
    // Préférences système
    autoRefresh: true,
    refreshInterval: 30,
    itemsPerPage: 10,
    enableNotifications: true,
    darkMode: false,
    
    // Préférences des logs
    defaultLogLevel: 'INFO',
    maxLogAge: 30,
    autoArchive: true,
    
    // Sécurité
    sessionTimeout: 60,
    enableTwoFactor: false,
  });
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      // Simulation d'appel API
      setSuccess('Profil mis à jour avec succès');
      setError('');
      
      // Reset password fields
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
      setSuccess('');
    }
  };

  const handleSaveSystemSettings = async () => {
    try {
      // Simulation d'appel API
      setSuccess('Paramètres système sauvegardés');
      setError('');
    } catch (err) {
      setError('Erreur lors de la sauvegarde des paramètres');
      setSuccess('');
    }
  };

  const exportSettings = () => {
    const settingsToExport = {
      ...settings,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    const blob = new Blob([JSON.stringify(settingsToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `log-monitor-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const systemInfo = [
    { label: 'Version', value: '1.0.0', icon: <Info /> },
    { label: 'Base de données', value: 'Connectée', icon: <CheckCircle color="success" /> },
    { label: 'Espace disque', value: '78% utilisé', icon: <Warning color="warning" /> },
    { label: 'Dernière sauvegarde', value: 'Il y a 2 heures', icon: <Storage /> },
  ];

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: '#333', fontWeight: 600 }}>
          ⚙️ Paramètres
        </Typography>
        
        <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
          Configuration et préférences du système
        </Typography>
      </motion.div>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profil utilisateur */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Person sx={{ color: '#e91e63' }} />
                  <Typography variant="h6" sx={{ color: '#e91e63' }}>
                    Profil utilisateur
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: '#e91e63',
                      fontSize: '1.5rem',
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{user?.username}</Typography>
                    <Chip
                      label={user?.isAdmin ? 'Administrateur' : 'Utilisateur'}
                      color={user?.isAdmin ? 'error' : 'primary'}
                      size="small"
                    />
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Mot de passe actuel"
                      value={settings.currentPassword}
                      onChange={(e) => handleSettingChange('currentPassword', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Nouveau mot de passe"
                      value={settings.newPassword}
                      onChange={(e) => handleSettingChange('newPassword', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirmer le mot de passe"
                      value={settings.confirmPassword}
                      onChange={(e) => handleSettingChange('confirmPassword', e.target.value)}
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  sx={{ mt: 2, backgroundColor: '#e91e63' }}
                  fullWidth
                >
                  Sauvegarder le profil
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Préférences système */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Palette sx={{ color: '#e91e63' }} />
                  <Typography variant="h6" sx={{ color: '#e91e63' }}>
                    Préférences système
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoRefresh}
                          onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Actualisation automatique des logs"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Intervalle de rafraîchissement (secondes)"
                      value={settings.refreshInterval}
                      onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                      size="small"
                      disabled={!settings.autoRefresh}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Éléments par page"
                      value={settings.itemsPerPage}
                      onChange={(e) => handleSettingChange('itemsPerPage', parseInt(e.target.value))}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableNotifications}
                          onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Activer les notifications"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.darkMode}
                          onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Mode sombre"
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSystemSettings}
                  sx={{ mt: 2, backgroundColor: '#e91e63' }}
                  fullWidth
                >
                  Sauvegarder les préférences
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Paramètres des logs */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Storage sx={{ color: '#e91e63' }} />
                  <Typography variant="h6" sx={{ color: '#e91e63' }}>
                    Paramètres des logs
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Niveau de log par défaut"
                      value={settings.defaultLogLevel}
                      onChange={(e) => handleSettingChange('defaultLogLevel', e.target.value)}
                      size="small"
                      SelectProps={{ native: true }}
                    >
                      <option value="DEBUG">DEBUG</option>
                      <option value="INFO">INFO</option>
                      <option value="WARNING">WARNING</option>
                      <option value="ERROR">ERROR</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Durée de conservation (jours)"
                      value={settings.maxLogAge}
                      onChange={(e) => handleSettingChange('maxLogAge', parseInt(e.target.value))}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoArchive}
                          onChange={(e) => handleSettingChange('autoArchive', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Archivage automatique des anciens logs"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Sécurité */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Security sx={{ color: '#e91e63' }} />
                  <Typography variant="h6" sx={{ color: '#e91e63' }}>
                    Sécurité
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Délai d'expiration de session (minutes)"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableTwoFactor}
                          onChange={(e) => handleSettingChange('enableTwoFactor', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Authentification à deux facteurs"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Actions système */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#e91e63' }}>
                  Actions système
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={exportSettings}
                  >
                    Exporter les paramètres
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Upload />}
                    component="label"
                  >
                    Importer les paramètres
                    <input type="file" hidden accept=".json" />
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    color="warning"
                  >
                    Réinitialiser
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom sx={{ color: '#e91e63' }}>
                  Informations système
                </Typography>

                <List dense>
                  {systemInfo.map((info, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {info.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={info.label}
                        secondary={info.value}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;