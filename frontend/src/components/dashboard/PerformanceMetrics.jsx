import React from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, Speed, CheckCircle, Warning } from '@mui/icons-material';

const MetricCard = ({ title, value, icon, color, subtitle, progress }) => (
  <Card sx={{ borderRadius: 3, height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="caption" color="textSecondary">
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
        <Box sx={{ bgcolor: `${color}20`, borderRadius: '50%', p: 1 }}>
          {icon}
        </Box>
      </Box>
      {progress !== undefined && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            mt: 1,
            height: 6,
            borderRadius: 3,
            bgcolor: `${color}25`,
            '& .MuiLinearProgress-bar': {
              bgcolor: color,
              borderRadius: 3
            }
          }}
        />
      )}
    </CardContent>
  </Card>
);

const PerformanceMetrics = ({ stats }) => {
  const theme = useTheme();

  const metrics = [
    {
      title: 'Disponibilidad',
      value: `${stats.availability || 95}%`,
      icon: <CheckCircle sx={{ color: theme.palette.success.main }} />,
      color: theme.palette.success.main,
      progress: stats.availability || 95,
      subtitle: `${stats.onlineVFDs || 0} de ${stats.totalVFDs || 0} en línea`
    },
    {
      title: 'Health Score Promedio',
      value: `${stats.avgHealth || 0}%`,
      icon: <Speed sx={{ color: theme.palette.primary.main }} />,
      color: stats.avgHealth > 80 ? theme.palette.success.main : theme.palette.warning.main,
      progress: stats.avgHealth || 0
    },
    {
      title: 'Alertas Activas',
      value: stats.activeAlerts || 0,
      icon: <Warning sx={{ color: stats.activeAlerts > 0 ? theme.palette.error.main : theme.palette.success.main }} />,
      color: stats.activeAlerts > 0 ? theme.palette.error.main : theme.palette.success.main,
      subtitle: stats.activeAlerts > 0 ? '⚠️ Atención requerida' : '✅ Sin alertas'
    },
    {
      title: 'Mantenimientos Pendientes',
      value: stats.pendingMaintenance || 0,
      icon: <TrendingUp sx={{ color: theme.palette.warning.main }} />,
      color: stats.pendingMaintenance > 0 ? theme.palette.warning.main : theme.palette.success.main,
      subtitle: stats.pendingMaintenance > 0 ? `${stats.pendingMaintenance} programados` : '✅ Al día'
    }
  ];

  return (
    <Grid container spacing={3}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <MetricCard {...metric} />
        </Grid>
      ))}
    </Grid>
  );
};

export default PerformanceMetrics;
