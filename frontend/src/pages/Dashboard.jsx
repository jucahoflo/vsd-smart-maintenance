import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Chip, useTheme, useMediaQuery } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useSocket } from '../hooks/useSocket';
import { vfds, alerts, maintenance } from '../api/endpoints';
import PerformanceMetrics from '../components/dashboard/PerformanceMetrics';
import HealthChart from '../components/dashboard/HealthChart';
import VFDStatusChart from '../components/dashboard/VFDStatusChart';
import MaintenanceChart from '../components/dashboard/MaintenanceChart';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { connected } = useSocket();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVFDs: 0,
    onlineVFDs: 0,
    offlineVFDs: 0,
    alarmVFDs: 0,
    maintenanceVFDs: 0,
    avgHealth: 0,
    availability: 0,
    activeAlerts: 0,
    pendingMaintenance: 0
  });
  const [healthHistory, setHealthHistory] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [vfdsList, setVfdsList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vfdsRes, alertsRes, maintenanceRes] = await Promise.all([
        vfds.getAll(),
        alerts.getActive(),
        maintenance.getAll()
      ]);

      const vfdsData = vfdsRes.data.data || [];
      const alertsData = alertsRes.data.data || [];
      const maintenanceData = maintenanceRes.data.data || [];

      setVfdsList(vfdsData);

      const online = vfdsData.filter(v => v.status === 'online').length;
      const offline = vfdsData.filter(v => v.status === 'offline').length;
      const alarm = vfdsData.filter(v => v.status === 'alarm').length;
      const maintenance = vfdsData.filter(v => v.status === 'maintenance').length;
      const avgHealth = vfdsData.length > 0 
        ? Math.round(vfdsData.reduce((acc, v) => acc + (v.health_score || 100), 0) / vfdsData.length)
        : 0;

      setStats({
        totalVFDs: vfdsData.length,
        onlineVFDs: online,
        offlineVFDs: offline,
        alarmVFDs: alarm,
        maintenanceVFDs: maintenance,
        avgHealth,
        availability: vfdsData.length > 0 ? Math.round((online / vfdsData.length) * 100) : 0,
        activeAlerts: alertsData.length,
        pendingMaintenance: maintenanceData.filter(m => m.status === 'pending').length
      });

      // Datos para gráficos de Health (simulados con los datos existentes)
      const healthData = vfdsData.map(v => ({
        date: new Date(v.created_at || Date.now()).toLocaleDateString(),
        health: v.health_score || 100
      }));
      setHealthHistory(healthData);

      // Datos para gráfico de mantenimiento
      const maintenanceByType = maintenanceData.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
      }, {});
      
      setMaintenanceData(Object.keys(maintenanceByType).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: maintenanceByType[key]
      })));

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" className="gradient-text">
          📊 Dashboard
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={connected ? '🔌 Conectado' : '🔌 Desconectado'}
            color={connected ? 'success' : 'error'}
            size={isMobile ? "small" : "medium"}
          />
          <IconButton onClick={loadData} sx={{ bgcolor: 'rgba(108,99,255,0.1)' }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Métricas de rendimiento */}
      <PerformanceMetrics stats={stats} />

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <HealthChart data={healthHistory} title="📈 Health Score Histórico" />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <VFDStatusChart data={{
              online: stats.onlineVFDs,
              offline: stats.offlineVFDs,
              alarm: stats.alarmVFDs,
              maintenance: stats.maintenanceVFDs
            }} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <MaintenanceChart data={maintenanceData} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              📋 Últimos VFDs Registrados
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>ID</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Fabricante</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Estado</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Health</th>
                  </tr>
                </thead>
                <tbody>
                  {vfdsList.slice(0, 5).map((vfd) => (
                    <tr key={vfd.id}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>{vfd.equipment_id}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>{vfd.manufacturer}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
                        <Chip
                          label={vfd.status}
                          size="small"
                          color={
                            vfd.status === 'online' ? 'success' :
                            vfd.status === 'alarm' ? 'warning' :
                            vfd.status === 'offline' ? 'error' : 'default'
                          }
                        />
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
                        {vfd.health_score || 100}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
