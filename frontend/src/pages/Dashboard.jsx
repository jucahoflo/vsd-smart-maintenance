import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Chip,
  Avatar, LinearProgress, IconButton, useTheme
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as OnlineIcon,
  Error as OfflineIcon,
  Build as MaintenanceIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Thermostat as TempIcon,
  FlashOn as PowerIcon
} from '@mui/icons-material';
import { useSocket } from '../hooks/useSocket';
import { mockVFDs, mockAlerts } from '../services/mockData';

const Dashboard = () => {
  const theme = useTheme();
  const { connected } = useSocket();
  const [vfdsList, setVfdsList] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    alarm: 0,
    avgHealth: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const data = mockVFDs;
      setVfdsList(data);
      setActiveAlerts(mockAlerts);
      
      const online = data.filter(v => v.status === 'online').length;
      const offline = data.filter(v => v.status === 'offline').length;
      const alarm = data.filter(v => v.status === 'alarm').length;
      const avgHealth = data.length > 0 
        ? Math.round(data.reduce((acc, v) => acc + (v.health_score || 100), 0) / data.length)
        : 0;
      
      setStats({
        total: data.length,
        online,
        offline,
        alarm,
        avgHealth
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return theme.palette.success.main;
      case 'offline': return theme.palette.error.main;
      case 'alarm': return theme.palette.warning.main;
      case 'maintenance': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <OnlineIcon sx={{ color: '#00B894', fontSize: 20 }} />;
      case 'offline': return <OfflineIcon sx={{ color: '#FF6B6B', fontSize: 20 }} />;
      case 'alarm': return <WarningIcon sx={{ color: '#FDCB6E', fontSize: 20 }} />;
      case 'maintenance': return <MaintenanceIcon sx={{ color: '#74B9FF', fontSize: 20 }} />;
      default: return <SpeedIcon />;
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ 
      borderRadius: 4, 
      p: 2,
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}25`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 24px ${color}25`
      }
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="700" sx={{ color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const VFDCard = ({ vfd }) => (
    <Card sx={{ 
      borderRadius: 4,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 16px 32px rgba(0,0,0,0.12)'
      }
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box>
            <Typography variant="h6" fontWeight="700">
              {vfd.equipment_id}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {vfd.manufacturer} • {vfd.model}
            </Typography>
          </Box>
          <Chip
            icon={getStatusIcon(vfd.status)}
            label={vfd.status}
            size="small"
            sx={{
              bgcolor: `${getStatusColor(vfd.status)}20`,
              color: getStatusColor(vfd.status),
              fontWeight: 600
            }}
          />
        </Box>

        <Box mt={2}>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Typography variant="caption" color="textSecondary">Potencia</Typography>
              <Typography fontWeight="600">{vfd.power_rating || '--'} kW</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="textSecondary">Voltaje</Typography>
              <Typography fontWeight="600">{vfd.voltage_rating || '--'} V</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="textSecondary">Health</Typography>
              <Chip
                label={`${vfd.health_score || 100}%`}
                size="small"
                sx={{
                  bgcolor: `${getHealthColor(vfd.health_score || 100)}25`,
                  color: getHealthColor(vfd.health_score || 100),
                  fontWeight: 700
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box mt={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="textSecondary">Health Score</Typography>
            <Typography fontWeight="700" sx={{ color: getHealthColor(vfd.health_score || 100) }}>
              {vfd.health_score || 100}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={vfd.health_score || 100}
            sx={{
              height: 6,
              borderRadius: 3,
              mt: 0.5,
              bgcolor: `${getHealthColor(vfd.health_score || 100)}25`,
              '& .MuiLinearProgress-bar': {
                bgcolor: getHealthColor(vfd.health_score || 100),
                borderRadius: 3
              }
            }}
          />
        </Box>

        <Box mt={1.5} display="flex" gap={2} flexWrap="wrap">
          {vfd.current_frequency && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <SpeedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight="500">
                {vfd.current_frequency} Hz
              </Typography>
            </Box>
          )}
          {vfd.current_temperature && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <TempIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight="500">
                {vfd.current_temperature} °C
              </Typography>
            </Box>
          )}
          {vfd.current_power && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <PowerIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight="500">
                {vfd.current_power} kW
              </Typography>
            </Box>
          )}
        </Box>

        {vfd.site && (
          <Typography variant="caption" color="textSecondary" display="block" mt={1}>
            📍 {vfd.site} • {vfd.department || ''}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box textAlign="center">
          <Typography variant="h5" fontWeight="600" color="textSecondary">
            Cargando...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="800" className="gradient-text">
            Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Monitoreo en tiempo real de tus variadores de velocidad
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            icon={connected ? <OnlineIcon /> : <OfflineIcon />}
            label={connected ? 'En vivo' : 'Desconectado'}
            color={connected ? 'success' : 'error'}
            sx={{ fontWeight: 600 }}
          />
          <IconButton onClick={loadData} sx={{ bgcolor: 'rgba(108,99,255,0.1)' }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total VFDs"
            value={stats.total}
            icon={<SpeedIcon />}
            color={theme.palette.primary.main}
            subtitle={`${stats.online} en línea`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Health Score"
            value={`${stats.avgHealth}%`}
            icon={<TrendingUpIcon />}
            color={getHealthColor(stats.avgHealth)}
            subtitle={stats.avgHealth >= 80 ? '✅ Excelente estado' : '⚠️ Requiere atención'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Alertas Activas"
            value={activeAlerts.length}
            icon={<WarningIcon />}
            color={activeAlerts.length > 0 ? theme.palette.error.main : theme.palette.success.main}
            subtitle={activeAlerts.length > 0 ? '🚨 Atención requerida' : '✅ Sin alertas'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="En Alerta"
            value={stats.alarm}
            icon={<MaintenanceIcon />}
            color={theme.palette.warning.main}
            subtitle={stats.alarm > 0 ? '⚠️ Requieren revisión' : '✅ Todos operativos'}
          />
        </Grid>
      </Grid>

      {/* Alertas */}
      {activeAlerts.length > 0 && (
        <Card sx={{ 
          borderRadius: 4, 
          mb: 4,
          bgcolor: '#FFF3F3',
          border: '1px solid #FF6B6B'
        }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <WarningIcon sx={{ color: '#FF6B6B' }} />
              <Box>
                <Typography fontWeight="600" color="#CC4A4A">
                  {activeAlerts.length} alerta{activeAlerts.length > 1 ? 's' : ''} activa{activeAlerts.length > 1 ? 's' : ''}
                </Typography>
                <Typography variant="body2" color="#CC4A4A">
                  {activeAlerts.map(a => a.message).join(' • ')}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* VFDs Grid */}
      <Typography variant="h5" fontWeight="700" mb={3}>
        ⚡ Variadores de Velocidad
      </Typography>
      <Grid container spacing={3}>
        {vfdsList.map((vfd, index) => (
          <Grid item xs={12} sm={6} lg={4} key={vfd.id} className={`fade-in fade-in-delay-${(index % 4) + 1}`}>
            <VFDCard vfd={vfd} />
          </Grid>
        ))}
        {vfdsList.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No hay VFDs registrados
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
