// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Grid, Card, CardContent, Typography, LinearProgress,
  Chip, IconButton, Alert, CircularProgress
} from '@mui/material';
import {
  Warning, CheckCircle, Refresh, Timeline, Storage
} from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #fff 0%, #f8f9ff 100%)',
        border: '1px solid #e2e8f0',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: `linear-gradient(45deg, ${color}15, ${color}10)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
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
          {typeof value === 'number' ? value.toLocaleString() : value}
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

const MetricBar = ({ name, value, color }) => (
  <Box mb={2}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
      <Typography variant="body2" fontWeight="500">
        {name}
      </Typography>
      <Typography variant="body2" color={color} fontWeight="600">
        {value}%
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={value}
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

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [logTrendData, setLogTrendData] = useState([]);
  const [logLevelData, setLogLevelData] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token'); // Récupère le token JWT
      if (!token) {
        setError('Utilisateur non authentifié. Veuillez vous connecter.');
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const data = response.data;

      setStats({
        totalLogs: data.totalLogs,
        todayLogs: data.todayLogs,
        errorRate: data.errorRate,
        systemHealth: data.systemHealth,
      });

      setLogTrendData(data.logTrendData || []);
      setLogLevelData(data.logLevelData || []);
      setSystemMetrics(data.systemMetrics || []);

      setLoading(false);
    } catch (err) {
      if (err.response) {
        // Erreur retournée par le serveur
        if (err.response.status === 401) {
          const msg = err.response.data?.message || '';
          if (msg.includes('Expired JWT Token')) {
            setError('Votre session a expiré. Veuillez vous reconnecter.');
            localStorage.removeItem('token');
            window.location.href = '/login'; // Redirige vers login
          } else {
            setError('Non autorisé.');
          }
        } else {
          setError(`Erreur serveur : ${err.response.status}`);
        }
      } else {
        // Erreur réseau ou autre
        setError('Erreur lors du chargement des statistiques');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
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
          </Typography>
        </Box>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <IconButton
            onClick={fetchStats}
            sx={{
              background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #c2185b, #7b1fa2)',
              }
            }}
          >
            <Refresh />
          </IconButton>
        </motion.div>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total des Logs"
            value={stats?.totalLogs || 0}
            subtitle="Depuis le début"
            icon={<Storage />}
            color="#e91e63"
            trend={12}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Logs Aujourd'hui"
            value={stats?.todayLogs || 0}
            subtitle="Dernières 24h"
            icon={<Timeline />}
            color="#9c27b0"
            trend={8}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Taux d'Erreur"
            value={`${stats?.errorRate || 0}%`}
            subtitle="Moyenne journalière"
            icon={<Warning />}
            color="#ff5722"
            trend={-2}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Santé Système"
            value={`${stats?.systemHealth || 0}%`}
            subtitle="État général"
            icon={<CheckCircle />}
            color="#4caf50"
            trend={5}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        {/* Log Trends */}
        <Grid item xs={12} lg={8}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ height: 400 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" mb={2} color="#2d3748">
                  Tendance des Logs (24h)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={logTrendData}>
                    <defs>
                      <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f44336" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f44336" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="warningGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff9800" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="infoGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#718096" />
                    <YAxis stroke="#718096" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area type="monotone" dataKey="errors" stackId="1" stroke="#f44336" fill="url(#errorGradient)" name="Erreurs" />
                    <Area type="monotone" dataKey="warnings" stackId="1" stroke="#ff9800" fill="url(#warningGradient)" name="Avertissements" />
                    <Area type="monotone" dataKey="info" stackId="1" stroke="#4caf50" fill="url(#infoGradient)" name="Informations" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Log Levels Distribution */}
        <Grid item xs={12} lg={4}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ height: 400 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" mb={2} color="#2d3748">
                  Distribution des Niveaux
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={logLevelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {logLevelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <Box mt={2}>
                  {logLevelData.map((item, index) => (
                    <Box key={index} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: item.color,
                            mr: 1
                          }}
                        />
                        <Typography variant="body2">{item.name}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="600">
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* System Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" mb={3} color="#2d3748">
                  Métriques Système
                </Typography>
                {systemMetrics.map((metric, index) => (
                  <MetricBar key={index} name={metric.name} value={metric.value} color={metric.color} />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
