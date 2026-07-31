import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper,
  CircularProgress, Chip, Avatar, Stack
} from '@mui/material';
import { 
  Speed, CheckCircle, Cancel, Warning, Build, 
  MonitorHeart
} from '@mui/icons-material';
import { supabase } from '../config/supabase';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    alarm: 0,
    maintenance: 0,
    avgHealthScore: 0,
    recentVfds: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const { data: allVfds, error } = await supabase
        .from('vsd')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!allVfds || allVfds.length === 0) {
        setStats({
          total: 0,
          online: 0,
          offline: 0,
          alarm: 0,
          maintenance: 0,
          avgHealthScore: 0,
          recentVfds: []
        });
        return;
      }

      const total = allVfds.length;
      const online = allVfds.filter(v => v.status === 'online').length;
      const offline = allVfds.filter(v => v.status === 'offline').length;
      const alarm = allVfds.filter(v => v.status === 'alarm').length;
      const maintenance = allVfds.filter(v => v.status === 'maintenance').length;
      
      const totalHealthScore = allVfds.reduce((acc, v) => acc + (v.health_score || 0), 0);
      const avgHealthScore = Math.round(totalHealthScore / total);

      const recentVfds = allVfds.slice(0, 5);

      setStats({
        total,
        online,
        offline,
        alarm,
        maintenance,
        avgHealthScore,
        recentVfds
      });

    } catch (error) {
      console.error('❌ Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'alarm': return 'warning';
      case 'maintenance': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'online': return '🟢 Online';
      case 'offline': return '🔴 Offline';
      case 'alarm': return '🟡 Alarma';
      case 'maintenance': return '🔧 Mantenimiento';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle color="success" />;
      case 'offline': return <Cancel color="error" />;
      case 'alarm': return <Warning color="warning" />;
      case 'maintenance': return <Build color="info" />;
      default: return <MonitorHeart />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando datos del Dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="800" color="primary">
          📊 Dashboard de VSDs
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Resumen en tiempo real del estado de los Variadores de Velocidad
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, p: 2, bgcolor: '#f0f7ff' }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Total VSDs</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: '#1976d2' }}><Speed /></Avatar>
                <Typography variant="h3" fontWeight="700">{stats.total}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, p: 2, bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Online</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: '#2e7d32' }}><CheckCircle /></Avatar>
                <Typography variant="h3" fontWeight="700">{stats.online}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, p: 2, bgcolor: '#ffebee' }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Offline / Alarma</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: '#c62828' }}><Cancel /></Avatar>
                <Typography variant="h3" fontWeight="700">{stats.offline + stats.alarm}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, p: 2, bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Health Score Promedio</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: '#e65100' }}><MonitorHeart /></Avatar>
                <Typography variant="h3" fontWeight="700">{stats.avgHealthScore}%</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="700" gutterBottom>📌 Distribución por Estado</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="space-around">
              <Box textAlign="center">
                <Typography variant="h5" color="success.main">{stats.online}</Typography>
                <Typography variant="body2" color="textSecondary">🟢 Online</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h5" color="error.main">{stats.offline}</Typography>
                <Typography variant="body2" color="textSecondary">🔴 Offline</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h5" color="warning.main">{stats.alarm}</Typography>
                <Typography variant="body2" color="textSecondary">🟡 Alarma</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h5" color="info.main">{stats.maintenance}</Typography>
                <Typography variant="body2" color="textSecondary">🔧 Mantenimiento</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="700" gutterBottom>🕒 Últimos VSDs Registrados</Typography>
            <Stack spacing={2}>
              {stats.recentVfds.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center">
                  No hay VSDs registrados aún.
                </Typography>
              ) : (
                stats.recentVfds.map((vfd) => (
                  <Box key={vfd.id} display="flex" justifyContent="space-between" alignItems="center" p={1} sx={{ borderBottom: '1px solid #eee' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600">{vfd.codigo_vsd}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {vfd.manufacturer || 'Sin fabricante'} {vfd.model || ''}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip 
                        icon={getStatusIcon(vfd.status)}
                        label={getStatusLabel(vfd.status)} 
                        color={getStatusColor(vfd.status)} 
                        size="small" 
                      />
                      <Typography variant="caption" color="textSecondary">
                        {vfd.health_score}% Health
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
