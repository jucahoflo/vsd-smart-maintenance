import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, Chip, useTheme,
  useMediaQuery, IconButton, Card, CardContent
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import { useSocket } from '../hooks/useSocket';
import { vfds, alerts, maintenance } from '../api/endpoints';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';

// Datos de prueba para mostrar siempre los gráficos
const MOCK_HEALTH_DATA = [
  { date: 'Lun', health: 85 },
  { date: 'Mar', health: 88 },
  { date: 'Mié', health: 82 },
  { date: 'Jue', health: 90 },
  { date: 'Vie', health: 81 },
  { date: 'Sáb', health: 78 },
  { date: 'Dom', health: 84 }
];

const MOCK_MAINTENANCE_DATA = [
  { name: 'Preventivo', value: 12 },
  { name: 'Correctivo', value: 5 },
  { name: 'Predictivo', value: 3 },
  { name: 'Emergencia', value: 2 }
];

const MOCK_VFDS = [
  { id: '1', equipment_id: 'VFD-001', manufacturer: 'ABB', status: 'online', health_score: 95 },
  { id: '2', equipment_id: 'VFD-002', manufacturer: 'Siemens', status: 'online', health_score: 88 },
  { id: '3', equipment_id: 'VFD-003', manufacturer: 'Danfoss', status: 'alarm', health_score: 65 },
  { id: '4', equipment_id: 'VFD-004', manufacturer: 'Schneider', status: 'offline', health_score: 45 },
  { id: '5', equipment_id: 'VFD-005', manufacturer: 'Yaskawa', status: 'online', health_score: 92 },
  { id: '6', equipment_id: 'VFD-006', manufacturer: 'ABB', status: 'online', health_score: 100 }
];

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { connected } = useSocket();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVFDs: 6,
    onlineVFDs: 4,
    offlineVFDs: 1,
    alarmVFDs: 1,
    maintenanceVFDs: 0,
    avgHealth: 81,
    activeAlerts: 1,
    pendingMaintenance: 2
  });
  const [healthHistory, setHealthHistory] = useState(MOCK_HEALTH_DATA);
  const [maintenanceData, setMaintenanceData] = useState(MOCK_MAINTENANCE_DATA);
  const [vfdsList, setVfdsList] = useState(MOCK_VFDS);

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

      if (vfdsData.length > 0) {
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
          activeAlerts: alertsData.length,
          pendingMaintenance: maintenanceData.filter(m => m.status === 'pending').length
        });

        const healthData = vfdsData.map(v => ({
          date: new Date(v.created_at || Date.now()).toLocaleDateString(),
          health: v.health_score || 100
        }));
        if (healthData.length > 0) setHealthHistory(healthData);

        const maintenanceByType = maintenanceData.reduce((acc, m) => {
          acc[m.type] = (acc[m.type] || 0) + 1;
          return acc;
        }, {});
        
        const maintData = Object.keys(maintenanceByType).map(key => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: maintenanceByType[key]
        }));
        if (maintData.length > 0) setMaintenanceData(maintData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption" color="textSecondary">{title}</Typography>
            <Typography variant="h4" fontWeight="700" sx={{ color }}>{value}</Typography>
            {subtitle && <Typography variant="caption" color="textSecondary">{subtitle}</Typography>}
          </Box>
          <Box sx={{ bgcolor: `${color}20`, borderRadius: '50%', p: 1 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

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
        <Typography variant="h4" fontWeight="800" color="primary">
          📊 Dashboard
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip label={connected ? '🔌 Conectado' : '🔌 Desconectado'} color={connected ? 'success' : 'error'} />
          <IconButton onClick={loadData}><RefreshIcon /></IconButton>
        </Box>
      </Box>

      {/* Métricas */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={6} sm={3}>
          <MetricCard title="Total VFDs" value={stats.totalVFDs} icon={<SpeedIcon />} color={theme.palette.primary.main} subtitle={`${stats.onlineVFDs} en línea`} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricCard title="Health Score" value={`${stats.avgHealth}%`} icon={<TrendingUpIcon />} color={stats.avgHealth > 80 ? theme.palette.success.main : theme.palette.warning.main} subtitle={stats.avgHealth > 80 ? 'Excelente' : 'Atención'} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricCard title="Alertas Activas" value={stats.activeAlerts} icon={<WarningIcon />} color={stats.activeAlerts > 0 ? theme.palette.error.main : theme.palette.success.main} subtitle={stats.activeAlerts > 0 ? 'Atención' : 'Sin alertas'} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricCard title="En Alerta" value={stats.alarmVFDs} icon={<BuildIcon />} color={theme.palette.warning.main} subtitle={stats.alarmVFDs > 0 ? 'Requieren revisión' : 'Operativos'} />
        </Grid>
      </Grid>

      {/* SECCIÓN DE GRÁFICOS */}
      <Box mb={2}>
        <Typography variant="h5" fontWeight="700" color="secondary">
          📈 GRÁFICOS Y ESTADÍSTICAS
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Visualización de datos en tiempo real
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Gráfico 1: Health Score */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>📈 Health Score Histórico</Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthHistory}>
                  <defs>
                    <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="health" stroke={theme.palette.primary.main} fill="url(#healthGradient)" name="Health Score" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico 2: Estado VFDs */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>🍩 Estado de VFDs</Typography>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Online', value: stats.onlineVFDs, color: '#4caf50' },
                      { name: 'Offline', value: stats.offlineVFDs, color: '#f44336' },
                      { name: 'Alarma', value: stats.alarmVFDs, color: '#ff9800' },
                      { name: 'Mantenimiento', value: stats.maintenanceVFDs, color: '#2196f3' }
                    ].filter(d => d.value > 0)}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={5} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: 'Online', value: stats.onlineVFDs, color: '#4caf50' },
                      { name: 'Offline', value: stats.offlineVFDs, color: '#f44336' },
                      { name: 'Alarma', value: stats.alarmVFDs, color: '#ff9800' },
                      { name: 'Mantenimiento', value: stats.maintenanceVFDs, color: '#2196f3' }
                    ].filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico 3: Mantenimientos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>📊 Mantenimientos por Tipo</Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico 4: Tabla VFDs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>📋 Últimos VFDs</Typography>
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
                        <Chip label={vfd.status} size="small" color={vfd.status === 'online' ? 'success' : vfd.status === 'alarm' ? 'warning' : vfd.status === 'offline' ? 'error' : 'default'} />
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>{vfd.health_score || 100}%</td>
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
