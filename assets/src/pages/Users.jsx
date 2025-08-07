import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Toolbar,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AdminPanelSettings,
  Person,
  Refresh,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { usersAPI } from '../api/axios';

const Users = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    roles: ['ROLE_USER']
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      setError('Accès non autorisé. Vous devez être administrateur.');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Données simulées
      setTimeout(() => {
        const mockUsers = [
          {
            id: 1,
            email: 'admin@example.com',
            roles: ['ROLE_ADMIN', 'ROLE_USER'],
            createdAt: '2025-07-15T10:30:00Z',
            lastLogin: '2025-08-01T14:25:00Z',
            active: true
          },
          {
            id: 2,
            email: 'user@example.com',
            roles: ['ROLE_USER'],
            createdAt: '2025-07-18T16:45:00Z',
            lastLogin: '2025-07-20T09:15:00Z',
            active: true
          },
          {
            id: 3,
            email: 'analyst@example.com',
            roles: ['ROLE_USER'],
            createdAt: '2025-07-19T11:20:00Z',
            lastLogin: '2025-07-19T18:30:00Z',
            active: false
          },
          {
            id: 4,
            email: 'salma@example.com',
            roles: ['ROLE_ADMIN'],
            createdAt: '2025-07-01T12:00:00Z',
            LastLogin: '2025-07-02T12:00:00Z',
            active: true
          },
          {
            id: 5,
            email: 'user1@example.com',
            roles: ['ROLE_USER'],
            createdAt: '2025-07-29T12:00:00Z',
            lastLogin: '2025-08-03T12:00:00Z',
            active: true
          },
          {
            id: 6,
            email: 'user2@example.com',
            roles: ['ROLE_USER'],
            createdAt: '2025-07-29T23:00:00Z',
            lastLogin: '2025-08-03T12:00:00Z',
            active: false
          }
          
        ];
        setUsers(mockUsers);
        setLoading(false);
      }, 800);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, user = null) => {
    setDialogMode(mode);
    setSelectedUser(user);
    
    if (mode === 'edit' && user) {
      setFormData({
        email: user.email,
        password: '',
        roles: user.roles
      });
    } else {
      setFormData({
        email: '',
        password: '',
        roles: ['ROLE_USER']
      });
    }
    
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setFormData({
      email: '',
      password: '',
      roles: ['ROLE_USER']
    });
    setError('');
    setSuccess('');
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setFormLoading(true);
      setError('');
      
      if (dialogMode === 'create') {
        // await usersAPI.createUser(formData);
        setSuccess('Utilisateur créé avec succès');
      } else {
        // await usersAPI.updateUser(selectedUser.id, formData);
        setSuccess('Utilisateur modifié avec succès');
      }
      
      setTimeout(() => {
        fetchUsers();
        handleCloseDialog();
        setFormLoading(false);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setFormLoading(true);
      // await usersAPI.deleteUser(selectedUser.id);
      setSuccess('Utilisateur supprimé avec succès');
      
      setTimeout(() => {
        fetchUsers();
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        setFormLoading(false);
      }, 1000);
    } catch (err) {
      setError('Erreur lors de la suppression');
      setFormLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return '#e91e63';
      case 'ROLE_USER': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Admin';
      case 'ROLE_USER': return 'Utilisateur';
      default: return role;
    }
  };

  if (!isAdmin()) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          Accès non autorisé. Vous devez être administrateur pour accéder à cette page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#2d3748">
            Gestion des Utilisateurs
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Administration des comptes utilisateurs du système
          </Typography>
        </Box>
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

      {/* Toolbar */}
      <Card sx={{ mb: 3 }}>
        <Toolbar sx={{ px: 3, py: 2 }}>
          <Typography variant="h6" flexGrow={1}>
            {users.length} utilisateur{users.length > 1 ? 's' : ''}
          </Typography>
          <IconButton onClick={fetchUsers} color="primary">
            <Refresh />
          </IconButton>
        </Toolbar>
      </Card>

      {/* Users Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9ff' }}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Email
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Rôles
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Statut
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Créé le
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Dernière connexion
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight="600">
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Aucun utilisateur trouvé
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {users.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      component={TableRow}
                      sx={{ '&:hover': { backgroundColor: '#f8f9ff' } }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          {user.roles.includes('ROLE_ADMIN') ? (
                            <AdminPanelSettings color="primary" />
                          ) : (
                            <Person color="action" />
                          )}
                          <Typography variant="body2" fontWeight="500">
                            {user.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {user.roles.map(role => (
                            <Chip
                              key={role}
                              label={getRoleLabel(role)}
                              size="small"
                              sx={{
                                backgroundColor: `${getRoleColor(role)}15`,
                                color: getRoleColor(role),
                                border: `1px solid ${getRoleColor(role)}30`,
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={user.active ? 'Actif' : 'Inactif'}
                          size="small"
                          sx={{
                            backgroundColor: user.active ? '#e8f5e8' : '#ffebee',
                            color: user.active ? '#2e7d32' : '#c62828',
                            border: `1px solid ${user.active ? '#4caf5030' : '#f4433630'}`,
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {formatDate(user.createdAt)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Jamais'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog('edit', user)}
                              color="primary"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteDialogOpen(true);
                              }}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add user"
        onClick={() => handleOpenDialog('create')}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
          '&:hover': {
            background: 'linear-gradient(45deg, #c2185b, #7b1fa2)',
          }
        }}
      >
        <Add />
      </Fab>

      {/* Create/Edit User Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="600">
            {dialogMode === 'create' ? 'Créer un utilisateur' : 'Modifier l\'utilisateur'}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#e91e63',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#e91e63',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#e91e63',
                },
              }}
            />

            {/* Password */}
            <TextField
              fullWidth
              label={dialogMode === 'create' ? 'Mot de passe' : 'Nouveau mot de passe (optionnel)'}
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleFormChange('password', e.target.value)}
              required={dialogMode === 'create'}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#e91e63',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#e91e63',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#e91e63',
                },
              }}
            />

            {/* Roles */}
            <FormControl fullWidth>
              <InputLabel
                sx={{
                  '&.Mui-focused': {
                    color: '#e91e63',
                  },
                }}
              >
                Rôles
              </InputLabel>
              <Select
                multiple
                value={formData.roles}
                onChange={(e) => handleFormChange('roles', e.target.value)}
                label="Rôles"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={getRoleLabel(value)}
                        size="small"
                        sx={{
                          backgroundColor: `${getRoleColor(value)}15`,
                          color: getRoleColor(value),
                        }}
                      />
                    ))}
                  </Box>
                )}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    '&:hover': {
                      borderColor: '#e91e63',
                    },
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e91e63',
                  },
                }}
              >
                <MenuItem value="ROLE_USER">Utilisateur</MenuItem>
                <MenuItem value="ROLE_ADMIN">Administrateur</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={formLoading || !formData.email || (dialogMode === 'create' && !formData.password)}
            sx={{
              background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
              '&:hover': {
                background: 'linear-gradient(45deg, #c2185b, #7b1fa2)',
              }
            }}
          >
            {formLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : dialogMode === 'create' ? (
              'Créer'
            ) : (
              'Modifier'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="600" color="error">
            Confirmer la suppression
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
            <strong>{selectedUser?.email}</strong> ?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={formLoading}
          >
            {formLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Supprimer'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;