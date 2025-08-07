import React, { useState, useEffect } from 'react';
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
  Paper,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Pagination,
  Alert,
  CircularProgress,
  Toolbar,
  InputAdornment,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem as DropdownMenuItem, // Renommé pour éviter les conflits
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Search,
  FilterList,
  Refresh,
  Download,
  ExpandMore,
  ExpandLess,
  Visibility,
  Error,
  Warning,
  Info,
  BugReport,
  TableChart, // Pour Excel
  PictureAsPdf // Pour PDF
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion, AnimatePresence } from 'framer-motion';
import logsAPI from '../api/axios'; // Import de l'instance axios configurée
// Import des bibliothèques pour l'export
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Pour l'export PDF

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5; // Doit correspondre à la limite côté backend
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    dateFrom: null,
    dateTo: null
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  // États pour le menu d'export
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');

      // Préparer les paramètres de requête pour le backend
      const params = {
        page: page,
        limit: itemsPerPage,
        search: filters.search || undefined,
        level: filters.level || undefined,
        dateFrom: filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : undefined, // Format YYYY-MM-DD
        dateTo: filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : undefined,     // Format YYYY-MM-DD
        // Ajouter export: false explicitement 
        // pour la requête normale de pagination.
      };

      console.log("Envoi de la requête GET à /logs avec params:", params);
      const response = await logsAPI.get('/logs', { params });

      console.log("Réponse brute du backend:", response.data);

      // Adapter la structure des données reçues
      let adaptedLogs = [];
      let totalFromResponse = 1;

      // S'adapter à la structure renvoyée par le backend
      // Cas 1: Le backend renvoie un objet avec 'data' (tableau de logs) et 'pagination'
      if (response.data && response.data.hasOwnProperty('data') && Array.isArray(response.data.data)) {
        adaptedLogs = response.data.data.map(log => ({
          id: log.id,
          timestamp: formatBackendDate(log.createdAt), // Adapter le nom du champ et le format
          level: log.level.toUpperCase(), // Mettre en majuscule pour correspondre aux filtres/affichage
          message: log.message,
          channel: log.channel,
          context: log.context, // Peut être null
          extra: log.extra,    // Peut être null
        }));
        // Utiliser les informations de pagination fournies par le backend
        totalFromResponse = response.data.pagination?.totalPages || Math.ceil(response.data.data.length / itemsPerPage) || 1;
      }
      // Cas 2: Le backend renvoie directement un tableau de logs (moins courant avec pagination)
      else if (Array.isArray(response.data)) {
        adaptedLogs = response.data.map(log => ({
          id: log.id,
          timestamp: formatBackendDate(log.createdAt),
          level: log.level.toUpperCase(),
          message: log.message,
          channel: log.channel,
          context: log.context,
          extra: log.extra,
        }));
        // Si pas d'info pagination, vous devrez peut-être la calculer ou la demander
        // totalPages est déjà à 1 par défaut
        totalFromResponse = Math.ceil(response.data.length / itemsPerPage) || 1;
      } else {
        console.error("Format de données inattendu reçu du backend:", response.data);
        setError("Format de données inattendu reçu du serveur.");
        setLogs([]);
        setTotalPages(1);
        setLoading(false);
        return; // Arrêter l'exécution si la structure est incorrecte
      }

      setLogs(adaptedLogs);
      setTotalPages(totalFromResponse);

    } catch (err) {
      console.error("Erreur lors du chargement des logs:", err);
      if (err.response) {
        if (err.response.status === 401) {
          setError("Vous n'êtes pas authentifié ou votre session a expiré. Veuillez vous reconnecter.");
        } else {
          setError(`Erreur ${err.response.status} du serveur: ${err.response.data?.message || err.response.statusText}`);
        }
      } else if (err.request) {
        setError("Impossible de contacter le serveur. Vérifiez votre connexion et que le backend est démarré.");
      } else {
        setError(`Erreur: ${err.message}`);
      }
      setLogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire pour formater les dates du backend
  const formatBackendDate = (dateString) => {
    // Le backend fournit 'YYYY-MM-DD HH:MM:SS'
    // new Date() peut le parser, mais on le convertit explicitement
    // pour éviter les problèmes de timezone.
    if (!dateString) return 'N/A';
    try {
      const [datePart, timePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes, seconds] = timePart.split(':').map(Number);
      // Crée une date en UTC et la convertit en chaîne locale pour l'affichage
      const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
      // Formatage pour affichage dans le tableau (ajuster selon vos préférences)
      return date.toLocaleString('fr-FR', { timeZone: 'UTC' }); 
      // Alternative plus simple juste conserver le format d'origine :
      // return dateString;
    } catch (e) {
      console.error("Erreur de formatage de la date:", dateString, e);
      return dateString; // Retourne la chaîne d'origine en cas d'erreur
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(1); // Réinitialiser à la première page lors d'un changement de filtre
  };

  const handleRowExpand = (logId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const handleViewDetail = (log) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const getLevelIcon = (level) => {
    const lowerLevel = level.toLowerCase();
    switch (lowerLevel) {
      case 'error': return <Error sx={{ fontSize: 16, color: '#f44336' }} />;
      case 'warning': return <Warning sx={{ fontSize: 16, color: '#ff9800' }} />;
      case 'info': return <Info sx={{ fontSize: 16, color: '#2196f3' }} />;
      case 'debug': return <BugReport sx={{ fontSize: 16, color: '#9e9e9e' }} />;
      default: return <Info sx={{ fontSize: 16, color: '#9e9e9e' }} />;
    }
  };

  const getLevelColor = (level) => {
    const lowerLevel = level.toLowerCase();
    switch (lowerLevel) {
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      case 'debug': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  // Fonction pour exporter en Excel - POUR RECUPERER TOUS LES LOGS
  const exportToExcel = async () => {
    try {
      console.log("Début de l'export Excel...");

      // --- Préparer les paramètres spécifiques pour l'export ---
      const exportParams = {
        // Indiquer au backend qu'il s'agit d'un export
        export: true,
        // Inclure les filtres actifs
        search: filters.search || undefined,
        level: filters.level || undefined,
        dateFrom: filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : undefined,
        dateTo: filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : undefined,
        // Le backend doit ignorer la pagination si export=true
      };

      console.log("Envoi de la requête GET à /logs pour export Excel avec params:", exportParams);
      const response = await logsAPI.get('/logs', { params: exportParams });

      console.log("Réponse brute du backend pour export Excel:", response.data);

      let logsToExport = [];
      if (Array.isArray(response.data)) {
        // Cas où le backend renvoie directement un tableau pour l'export
        logsToExport = response.data;
      } else if (response.data && response.data.hasOwnProperty('data') && Array.isArray(response.data.data)) {
        // Cas où le backend renvoie { data: [...], pagination: {...} } même pour l'export
        logsToExport = response.data.data;
      } else {
        console.error("Format de données inattendu pour l'export Excel:", response.data);
        alert("Impossible de récupérer les données pour l'export Excel.");
        setExportMenuAnchor(null);
        return;
      }

      if (logsToExport.length === 0) {
        alert("Aucun log à exporter avec les filtres actuels.");
        setExportMenuAnchor(null);
        return;
      }

      // Adapter pour l'export (format brut du backend)
      const worksheetData = logsToExport.map(log => ({
        ID: log.id,
        Timestamp: log.createdAt, // Garder le format original pour l'export
        Niveau: log.level.toUpperCase(),
        Canal: log.channel,
        Message: log.message,
        Contexte: JSON.stringify(log.context),
        Informations: JSON.stringify(log.extra),
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
      const fileName = `logs_${new Date().toISOString().slice(0, 10)}_${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      console.log(`Fichier Excel téléchargé: ${fileName}`);

    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
      if (error.response) {
        alert(`Erreur ${error.response.status} lors de l'export Excel: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        alert("Impossible de contacter le serveur pour l'export Excel.");
      } else {
        alert(`Erreur lors de l'export Excel: ${error.message}`);
      }
    } finally {
      setExportMenuAnchor(null);
    }
  };

  // Fonction pour exporter en PDF - POUR RECUPERER TOUS LES LOGS
  const exportToPDF = async () => {
    try {
      console.log("Début de l'export PDF...");

      // ---  Préparer les paramètres spécifiques pour l'export ---
      const exportParams = {
        export: true, // Paramètre indicateur pour le backend
        search: filters.search || undefined,
        level: filters.level || undefined,
        dateFrom: filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : undefined,
        dateTo: filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : undefined,
      };

      console.log("Envoi de la requête GET à /logs pour export PDF avec params:", exportParams);
      const response = await logsAPI.get('/logs', { params: exportParams });

      console.log("Réponse brute du backend pour export PDF:", response.data);

      let filteredLogs = [];
       if (Array.isArray(response.data)) {
         filteredLogs = response.data;
       } else if (response.data && response.data.hasOwnProperty('data') && Array.isArray(response.data.data)) {
         filteredLogs = response.data.data;
       } else {
        console.error("Format de données inattendu pour l'export PDF:", response.data);
        alert("Impossible de récupérer les données pour l'export PDF.");
        setExportMenuAnchor(null);
        return;
      }

      if (filteredLogs.length === 0) {
        alert("Aucun log à exporter avec les filtres actuels.");
        setExportMenuAnchor(null);
        return;
      }

      console.log(`Logs filtrés pour le PDF: ${filteredLogs.length}`);

      const doc = new jsPDF();
      console.log("Instance jsPDF créée");

      doc.setFontSize(18);
      doc.text("Rapport des Logs", 14, 20);
      console.log("Titre ajouté");

      doc.setFontSize(12);
      let filterText = "";
      try {
        filterText = [
          `Recherche: ${filters.search || 'Aucun'}`,
          `Niveau: ${filters.level || 'Tous'}`,
          `Du: ${filters.dateFrom ? filters.dateFrom.toLocaleDateString('fr-FR') : 'Début'}`,
          `Au: ${filters.dateTo ? filters.dateTo.toLocaleDateString('fr-FR') : 'Maintenant'}`
        ].join(' | ');
      } catch (dateError) {
        console.error("Erreur lors de la conversion des dates pour le PDF:", dateError);
        filterText = "Erreur lors de la récupération des filtres de date";
      }
      doc.text(filterText, 14, 30);
      console.log("Filtres ajoutés");

      if (filteredLogs.length > 0) {
        // Adapter pour le PDF (format brut du backend)
        const tableBody = filteredLogs.map(log => [
          log.id,
          log.createdAt, // Utiliser le format brut du backend
          log.level.toUpperCase(),
          log.channel,
          log.message.substring(0, 50) + (log.message.length > 50 ? '...' : '')
        ]);

        autoTable(doc, {
          startY: 40,
          head: [['ID', 'Timestamp', 'Niveau', 'Canal', 'Message']],
          body: tableBody,
          styles: {
            fontSize: 8
          },
          headStyles: {
            fillColor: [63, 81, 181]
          }
        });
        console.log("Tableau ajouté");
      } else {
        doc.text("Aucun log à afficher avec les filtres actuels.", 14, 45);
        console.log("Message 'Aucun log' ajouté");
      }

      const fileName = `logs_${new Date().toISOString().slice(0, 10)}_${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '-')}.pdf`;
      console.log(`Tentative de sauvegarde du PDF: ${fileName}`);
      doc.save(fileName);
      console.log("PDF sauvegardé avec succès");

    } catch (error) {
      console.error("Erreur détaillée lors de l'export PDF:", error);
      if (error.response) {
        alert(`Erreur ${error.response.status} lors de l'export PDF: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        alert("Impossible de contacter le serveur pour l'export PDF.");
      } else {
        alert(`Erreur lors de l'export PDF: ${error.message}`);
      }
    } finally {
      setExportMenuAnchor(null);
    }
  };

  // Fonctions pour gérer le menu d'export
  const handleExportClick = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="#2d3748">
              Gestion des Logs
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={0.5}>
              Consultation et analyse des fichiers de logs système
            </Typography>
          </Box>
        </Box>
        {/* Toolbar */}
        <Card sx={{ mb: 3 }}>
          <Toolbar sx={{ px: 3, py: 2 }}>
            <Box display="flex" alignItems="center" gap={2} flexGrow={1}>
              {/* Search */}
              <TextField
                size="small"
                placeholder="Rechercher dans les logs..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
              {/* Level Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Niveau</InputLabel>
                <Select
                  value={filters.level}
                  label="Niveau"
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  {/* Options mises en minuscules pour correspondre au backend */}
                  <MenuItem value="error">Erreur</MenuItem>
                  <MenuItem value="warning">Avertissement</MenuItem>
                  <MenuItem value="info">Information</MenuItem>
                  {/* <MenuItem value="debug">Debug</MenuItem> */}
                </Select>
              </FormControl>
              {/* Advanced Filters Toggle */}
              <Button
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                variant={showFilters ? "contained" : "outlined"}
                size="small"
              >
                Filtres
              </Button>
            </Box>
            {/* Actions */}
            <Box display="flex" gap={1}>
              <IconButton onClick={fetchLogs} color="primary">
                <Refresh />
              </IconButton>

              {/* Bouton d'export avec menu déroulant */}
              <>
                <IconButton
                  onClick={handleExportClick}
                  color="primary"
                  aria-controls="export-menu"
                  aria-haspopup="true"
                >
                  <Download />
                </IconButton>
                <Menu
                  id="export-menu"
                  anchorEl={exportMenuAnchor}
                  open={Boolean(exportMenuAnchor)}
                  onClose={handleExportClose}
                >
                  <DropdownMenuItem onClick={exportToExcel}>
                    <ListItemIcon>
                      <TableChart fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Exporter en Excel</ListItemText>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToPDF}>
                    <ListItemIcon>
                      <PictureAsPdf fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Exporter en PDF</ListItemText>
                  </DropdownMenuItem>
                </Menu>
              </>
            </Box>
          </Toolbar>
          {/* Advanced Filters */}
          <Collapse in={showFilters}>
            <Box sx={{ px: 3, pb: 2, borderTop: '1px solid #e2e8f0' }}>
              <Box display="flex" gap={2} mt={2}>
                <DatePicker
                  label="Date de début"
                  value={filters.dateFrom}
                  onChange={(date) => handleFilterChange('dateFrom', date)}
                  slotProps={{ textField: { size: 'small' }}}
                />
                <DatePicker
                  label="Date de fin"
                  value={filters.dateTo}
                  onChange={(date) => handleFilterChange('dateTo', date)}
                  slotProps={{ textField: { size: 'small' }}}
                />
              </Box>
            </Box>
          </Collapse>
        </Card>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {/* Logs Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9ff' }}>
                  <TableCell width="50px"></TableCell>
                  <TableCell width="180px">
                    <Typography variant="subtitle2" fontWeight="600">
                      Timestamp
                    </Typography>
                  </TableCell>
                  <TableCell width="100px">
                    <Typography variant="subtitle2" fontWeight="600">
                      Niveau
                    </Typography>
                  </TableCell>
                  <TableCell width="120px">
                    <Typography variant="subtitle2" fontWeight="600">
                      Canal
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      Message
                    </Typography>
                  </TableCell>
                  <TableCell width="100px" align="center">
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
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Aucun log trouvé
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence>
                    {logs.map((log, index) => (
                      <React.Fragment key={log.id}>
                        <motion.tr
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          component={TableRow}
                          sx={{
                            '&:hover': { backgroundColor: '#f8f9ff' },
                            borderLeft: `4px solid ${getLevelColor(log.level)}`
                          }}
                        >
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleRowExpand(log.id)}
                            >
                              {expandedRows.has(log.id) ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {log.timestamp}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getLevelIcon(log.level)}
                              label={log.level}
                              size="small"
                              sx={{
                                backgroundColor: `${getLevelColor(log.level)}15`,
                                color: getLevelColor(log.level),
                                border: `1px solid ${getLevelColor(log.level)}30`,
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={log.channel}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          </TableCell>
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
                              {log.message}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetail(log)}
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>
                          </TableCell>
                        </motion.tr>
                        {/* Expanded Row */}
                        <TableRow>
                          <TableCell sx={{ py: 0, border: 0 }} colSpan={6}>
                            <Collapse
                              in={expandedRows.has(log.id)}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ py: 2, px: 4, backgroundColor: '#f8f9ff' }}>
                                <Typography variant="subtitle2" fontWeight="600" mb={1}>
                                  Message complet:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontFamily="monospace"
                                  sx={{
                                    backgroundColor: '#fff',
                                    p: 2,
                                    borderRadius: 1,
                                    border: '1px solid #e2e8f0',
                                    mb: 2
                                  }}
                                >
                                  {log.message}
                                </Typography>
                                {log.context !== null && Object.keys(log.context).length > 0 && (
                                  <Box mb={2}>
                                    <Typography variant="subtitle2" fontWeight="600" mb={1}>
                                      Contexte:
                                    </Typography>
                                    <Box
                                      sx={{
                                        backgroundColor: '#fff',
                                        p: 2,
                                        borderRadius: 1,
                                        border: '1px solid #e2e8f0'
                                      }}
                                    >
                                      <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                                        {JSON.stringify(log.context, null, 2)}
                                      </pre>
                                    </Box>
                                  </Box>
                                )}
                                {log.extra !== null && Object.keys(log.extra).length > 0 && (
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight="600" mb={1}>
                                      Informations supplémentaires:
                                    </Typography>
                                    <Box
                                      sx={{
                                        backgroundColor: '#fff',
                                        p: 2,
                                        borderRadius: 1,
                                        border: '1px solid #e2e8f0'
                                      }}
                                    >
                                      <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                                        {JSON.stringify(log.extra, null, 2)}
                                      </pre>
                                    </Box>
                                  </Box>
                                )}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Pagination */}
          {!loading && logs.length > 0 && (
            <Box display="flex" justifyContent="center" p={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, newPage) => setPage(newPage)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Card>
        {/* Detail Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              {selectedLog && getLevelIcon(selectedLog.level)}
              <Typography variant="h6">
                Détail du Log
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedLog && (
              <Box>
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Timestamp
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {selectedLog.timestamp}
                  </Typography>
                </Box>
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Niveau
                  </Typography>
                  <Chip
                    icon={getLevelIcon(selectedLog.level)}
                    label={selectedLog.level}
                    sx={{
                      backgroundColor: `${getLevelColor(selectedLog.level)}15`,
                      color: getLevelColor(selectedLog.level),
                      border: `1px solid ${getLevelColor(selectedLog.level)}30`
                    }}
                  />
                </Box>
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Canal
                  </Typography>
                  <Typography variant="body1">{selectedLog.channel}</Typography>
                </Box>
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Message
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: '#f8f9ff',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Typography variant="body1" fontFamily="monospace">
                      {selectedLog.message}
                    </Typography>
                  </Paper>
                </Box>
                {selectedLog.context !== null && Object.keys(selectedLog.context).length > 0 && (
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Contexte
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: '#f8f9ff',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <pre style={{ margin: 0, fontSize: '0.85rem' }}>
                        {JSON.stringify(selectedLog.context, null, 2)}
                      </pre>
                    </Paper>
                  </Box>
                )}
                {selectedLog.extra !== null && Object.keys(selectedLog.extra).length > 0 && (
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Informations supplémentaires
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: '#f8f9ff',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <pre style={{ margin: 0, fontSize: '0.85rem' }}>
                        {JSON.stringify(selectedLog.extra, null, 2)}
                      </pre>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Logs;