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
import { supabase } from '../config/supabase';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';

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
      setLoading(true);
      
      // 1. Obtener todos los VSDs de tu tabla real
      const { data: vsdData, error } = await supabase
        .from('vsd')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const vfdsData = vsdData || [];

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
          activeAlerts: alarm, // Asumimos que las alarmas son los VSDs en estado 'alarm'
          pendingMaintenance: maintenance // Asumimos que mantenimiento son los VSDs en estado 'maintenance'
        });

        // Generar historial de salud basado en los datos reales
        const healthData = vfdsData.map(v => ({
          date: new Date(v.created_at || Date.now()).toLocaleDateString(),
          health: v.health_score || 100
        }));
        if (healthData.length > 0) setHealthHistory(healthData);

        // Datos de mantenimiento basados en el estado real
        const maintenanceByType = vfdsData.reduce((acc, v) => {
          if (v.status === 'maintenance') {
            acc['Mantenimiento'] = (acc['Mantenimiento'] || 0) + 1;
          } else if (v.status === 'alarm') {
            acc['Alarma'] = (acc['Alarma'] || 0) + 1;
          } else if (v.status === 'offline') {
            acc['Offline'] = (acc['Offline'] || 0) + 1;
          } else if (v.status === 'online') {
            acc['Online'] = (acc['Online'] || 0) + 1;
          }
          return acc;
        }, {});
        
        const maintData = Object.keys(maintenanceByType).map(key => ({
          name: key,
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
          <MetricCard title="Total VSDs" value={stats.totalVFDs} icon={<SpeedIcon />} color={theme.palette.primary.main} subtitle={`${stats.onlineVFDs} en línea`} />
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
                <AreaChart data={healthHistory.length > 0 ? healthHistory : [{date: 'Sin datos', health: 0}]}>
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

        {/* Gráfico 2: Estado VSDs */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>🍩 Estado de VSDs</Typography>
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

        {/* Gráfico 3: Mantenimientos por Estado */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>📊 Distribución por Estado</Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceData.length > 0 ? maintenanceData : [{name: 'Sin datos', value: 0}]}>
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

        {/* Gráfico 4: Tabla Últimos VSDs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>📋 Últimos VSDs</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Código</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Fabricante</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Estado</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Health</th>
                  </tr>
                </thead>
                <tbody>
                  {vfdsList.slice(0, 5).map((vfd) => (
                    <tr key={vfd.id}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>{vfd.codigo_vsd}</td>
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
