import React from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import BuildIcon from '@mui/icons-material/Build';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ backgroundColor: `${color}20`, borderRadius: '50%', p: 1 }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

const StatsCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  const cards = [
    {
      title: 'Total VFDs',
      value: stats.totalVFDs || 0,
      icon: <SpeedIcon sx={{ color: '#1976d2' }} />,
      color: '#1976d2',
      subtitle: `${stats.onlineVFDs || 0} en línea`
    },
    {
      title: 'Health Score Promedio',
      value: `${stats.avgHealth || 0}%`,
      icon: <CheckCircleIcon sx={{ color: '#4caf50' }} />,
      color: '#4caf50',
      subtitle: stats.avgHealth > 80 ? '✅ Buen estado' : '⚠️ Revisar'
    },
    {
      title: 'Alertas Activas',
      value: stats.activeAlerts || 0,
      icon: <WarningIcon sx={{ color: '#ff9800' }} />,
      color: '#ff9800',
      subtitle: stats.activeAlerts > 0 ? '🚨 Atención requerida' : '✅ Sin alertas'
    },
    {
      title: 'Mantenimientos',
      value: stats.totalMaintenance || 0,
      icon: <BuildIcon sx={{ color: '#9c27b0' }} />,
      color: '#9c27b0',
      subtitle: `${stats.pendingMaintenance || 0} pendientes`
    }
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;
