import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
  Grid,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Refresh,
  Download,
  Search,
  GetApp,
  Description,
  FilterList,
  PlayArrow,
  Pause,
  CloudDownload,
  Folder,
  Schedule,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Filtres
  const [filters, setFilters] = useState({
    level: '',
    search: '',
    dateFrom: null,
    dateTo: null,
  });

  const logLevels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
        dateFrom: filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : null,
        dateTo: filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : null,
      };

      // Nettoyer les paramètres vides
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await axios.get('/logs', { params });
      
      setLogs(response.data.logs || []);
      setTotalLogs(response.data.total || 0);
    } catch (err) {
      console.error('Erreur lors du chargement des logs:', err);
      setError('Erreur lors du chargement des logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    setPage(0);
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({
      level: '',
      search: '',
      dateFrom: null,
      dateTo: null,
    });
    setPage(0);
    setTimeout(() => fetchLogs(), 100);
  };

  const getLogLevelColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'DEBUG': return 'default';
      case 'INFO': return 'primary';
      case 'WARNING': return 'warning';
      case 'ERROR': return 'error';
      case 'CRITICAL': return 'error';
      default: return 'default';
    }
  };

  const handleExpandRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const exportLogs = async () => {
    try {
      const response = await axios.get('/logs/export', {
        params: {
          ...filters,
          dateFrom: filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : null,
          dateTo: filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : null,
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ color: '#333', fontWeight: 600 }}>
          📋 Gestion des Logs
        </Typography>

        {/* Filtres */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#e91e63' }}>
              Filtres
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Niveau</InputLabel>
                  <Select
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    label="Niveau"
                  >
                    <MenuItem value="">Tous</MenuItem>
                    {logLevels.map((level) => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Rechercher"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: '#666' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Date début"
                  value={filters.dateFrom}
                  onChange={(value) => handleFilterChange('dateFrom', value)}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Date fin"
                  value={filters.dateTo}
                  onChange={(value) => handleFilterChange('dateTo', value)}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    onClick={applyFilters}
                    sx={{ backgroundColor: '#e91e63' }}
                  >
                    Filtrer
                  </Button>
                  <Button variant="outlined" onClick={resetFilters}>
                    Reset
                  </Button>
                  <IconButton onClick={fetchLogs} color="primary">
                    <Refresh />
                  </IconButton>
                  <IconButton onClick={exportLogs} color="secondary">
                    <Download />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Table des logs */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#e91e63' }}>
                Logs du système ({totalLogs} entrées)
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Date/Heure</TableCell>
                        <TableCell>Niveau</TableCell>
                        <TableCell>Canal</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell width={50}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                            <Typography color="textSecondary">
                              Aucun log trouvé
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        logs.map((log, index) => (
                          <React.Fragment key={index}>
                            <TableRow hover>
                              <TableCell>
                                {log.datetime ? new Date(log.datetime).toLocaleString('fr-FR') : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={log.level || 'INFO'}
                                  color={getLogLevelColor(log.level)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{log.channel || 'app'}</TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 400,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {log.message || 'Message non disponible'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => handleExpandRow(index)}
                                >
                                  {expandedRow === index ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                              </TableCell>
                            </TableRow>
                            
                            <TableRow>
                              <TableCell colSpan={5} sx={{ p: 0 }}>
                                <Collapse in={expandedRow === index}>
                                  <Box sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Détails du log :
                                    </Typography>
                                    <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                                      {JSON.stringify(log, null, 2)}
                                    </Typography>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={totalLogs}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Lignes par page:"
                  labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                  }
                />
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default Logs;