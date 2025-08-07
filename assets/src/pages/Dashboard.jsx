import React, { useState, useEffect } from 'react';
import logsAPI from '../api/axios'; 
import {
  Box, Grid, Card, CardContent, Typography, LinearProgress,
  Chip, IconButton, Alert, CircularProgress
} from '@mui/material';
import { Warning, CheckCircle, Refresh, Timeline, Storage } from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';

// --- Composants réutilisables (inchangés) ---
const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box sx={{ color, fontSize: 28 }}>
            {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
          </Box>
          {trend !== undefined && (
            <Chip
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              size="small"
              sx={{
                bgcolor: trend > 0 ? '#e8f5e8' : '#ffebee',
                color: trend > 0 ? '#2e7d32' : '#c62828',
                fontWeight: 600
              }}
            />
          )}
        </Box>
        <Typography variant="h4" fontWeight="bold" color={color} mb={0.5}>
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight="500">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" mt={1} display="block">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// Composant TrendChart mis à jour pour s'attendre à 'logs' comme dataKey
const TrendChart = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis
        dataKey="time"
        tick={{ fontSize: 12, fill: '#718096' }}
        tickLine={false}
        axisLine={false}
      />
      <YAxis
        tick={{ fontSize: 12, fill: '#718096' }}
        tickLine={false}
        axisLine={false}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
        // formatter={(value, name) => [value, name === 'logs' ? 'Total Logs' : name]} // Optionnel: formater le tooltip
      />
      {/* Utiliser 'logs' comme dataKey pour correspondre aux données transformées */}
      <Area
        type="monotone"
        dataKey="logs"
        stroke="#8884d8"
        fill="url(#colorLogs)"
        fillOpacity={0.3}
        strokeWidth={2}
        dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
        activeDot={{ r: 5, strokeWidth: 0 }}
      />
      <defs>
        <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
        </linearGradient>
      </defs>
    </AreaChart>
  </ResponsiveContainer>
);


const LogLevelChart = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        // Afficher le nom en majuscule s'il est présent
        label={({ name, percent }) => `${name?.toUpperCase() || name} ${(percent * 100).toFixed(0)}%`}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip
        formatter={(value) => [value, 'Logs']}
        contentStyle={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      />
    </PieChart>
  </ResponsiveContainer>
);

const MetricBar = ({ name, value, color, unavailable = false }) => (
  <Box mb={2}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
      <Typography variant="body2" fontWeight="500">
        {name} {unavailable && <span style={{ color: '#90a4ae' }}>(N/A)</span>}
      </Typography>
      <Typography variant="body2" color={color} fontWeight="600">
        {unavailable ? 'N/A' : `${value}%`}
      </Typography>
    </Box>
    <LinearProgress
      variant={unavailable ? "determinate" : "determinate"}
      value={unavailable ? 0 : value}
      sx={{
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e2e8f0',
        '& .MuiLinearProgress-bar': {
          backgroundColor: color,
          borderRadius: 4,
        },
      }}
    />
  </Box>
);
// --- Fin des composants réutilisables ---

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    errorRate: 0,
    systemHealth: 50,
  });
  const [logTrendData, setLogTrendData] = useState([]);
  const [logLevelData, setLogLevelData] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null); // Nouvel état pour lastUpdate
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      // Appeler l'endpoint /api/stats du backend
      const response = await logsAPI.get('/stats');

      console.log("Données brutes des statistiques reçues du backend:", response.data);

      const data = response.data;

      // Mettre à jour les statistiques principales
      setStats({
        totalLogs: parseInt(data.totalLogs, 10) || 0,
        todayLogs: parseInt(data.todayLogs, 10) || 0,
        errorRate: parseFloat(data.errorRate) || 0,
        systemHealth: parseFloat(data.systemHealth) || 50,
      });

      // Adapter logLevelData : s'assurer que les noms sont en majuscules si désiré
      // (Le composant s'en occupe aussi via label, mais on le fait ici aussi pour cohérence)
      const adaptedLogLevelData = (data.logLevelData || []).map(item => ({
        ...item,
        name: item.name?.toUpperCase() || item.name // Mettre en majuscule
      }));
      setLogLevelData(adaptedLogLevelData);

      const adaptedLogTrendData = (data.logTrendData || []).map(item => {
        // Agréger info, warnings, errors pour obtenir le total de logs pour le jour
        const totalLogsForDay = (item.info || 0) + (item.warnings || 0) + (item.errors || 0);
        // Reformater la date de 'YYYY-MM-DD' à 'DD/MM'
        let formattedTime = item.time;
        if (item.time) {
            const parts = item.time.split('-');
            if (parts.length === 3) {
                // Assumer le format est YYYY-MM-DD
                formattedTime = `${parts[2]}/${parts[1]}`; // DD/MM
            }
        }
        return {
          time: formattedTime,
          logs: totalLogsForDay
          
        };
      });
      setLogTrendData(adaptedLogTrendData);

      // Utiliser systemMetrics directement
      setSystemMetrics(data.systemMetrics || []);

      // Optionnel: stocker lastUpdate
      if (data.lastUpdate) {
          setLastUpdate(data.lastUpdate);
      }

      setLoading(false);
    } catch (err) {
      console.error("Erreur détaillée lors de la récupération des statistiques:", err);
      if (err.response) {
        setError(`Erreur ${err.response.status} du serveur: ${err.response.data?.message || err.response.statusText}`);
      } else if (err.request) {
        setError("Impossible de contacter le serveur pour récupérer les statistiques. Vérifiez votre connexion et que le backend est démarré.");
      } else {
        setError(`Erreur: ${err.message}`);
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#2d3748">
            Tableau de Bord
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Vue d'ensemble du système de monitoring des logs
            {/* Optionnel: Afficher lastUpdate */}
            {lastUpdate && (
              <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                Dernière mise à jour : {new Date(lastUpdate).toLocaleString('fr-FR')}
              </Typography>
            )}
          </Typography>
        </Box>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <IconButton
            onClick={fetchStats}
            sx={{
              background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #d81b60, #8e24aa)',
              },
              boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
            }}
          >
            <Refresh />
          </IconButton>
        </motion.div>
      </Box>

      {/* Statistiques Principales */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total des Logs"
            value={stats.totalLogs}
            subtitle="Depuis le début"
            icon={<Storage />}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Logs Aujourd'hui"
            value={stats.todayLogs}
            subtitle="Dernières 24h"
            icon={<Timeline />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Taux d'Erreur"
            value={`${stats.errorRate.toFixed(2)}%`}
            subtitle="Logs critiques"
            icon={<Warning />}
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Santé Système"
            value={`${stats.systemHealth.toFixed(0)}%`}
            subtitle="Performance globale"
            icon={<CheckCircle />}
            color={stats.systemHealth > 70 ? "#4caf50" : (stats.systemHealth > 30 ? "#ff9800" : "#f44336")}
          />
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ height: 400 }}>
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="600" mb={2} color="#2d3748">
                  Tendance des Logs (24h)
                </Typography>
                {logTrendData.length > 0 ? (
                  <TrendChart data={logTrendData} />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="80%">
                    <Typography color="text.secondary">Aucune donnée de tendance disponible</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ height: 400 }}>
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="600" mb={2} color="#2d3748">
                  Distribution des Niveaux
                </Typography>
                {logLevelData.length > 0 ? (
                  <LogLevelChart data={logLevelData} />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="80%">
                    <Typography color="text.secondary">Aucune donnée de niveau disponible</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" mb={3} color="#2d3748">
                  Métriques Système
                </Typography>
                {systemMetrics.length > 0 ? (
                  systemMetrics.map((metric, index) => (
                    <MetricBar
                      key={index}
                      name={metric.name}
                      value={metric.value}
                      color={metric.color}
                      unavailable={metric.unavailable}
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">Aucune métrique système disponible</Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;