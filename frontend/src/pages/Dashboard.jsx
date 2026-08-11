import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Paper, 
  Avatar, Stack, Button, useTheme, useMediaQuery 
} from '@mui/material';
import { 
  Speed, Build, Inventory, Description, Settings, Dashboard as DashboardIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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

      setStats({
        total,
        online,
        offline,
        alarm,
        maintenance,
        avgHealthScore,
        recentVfds: allVfds.slice(0, 5)
      });
    } catch (error) {
      console.error('❌ Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Definición de las tarjetas de navegación
  const navCards = [
    { title: 'VFDs', icon: <Speed sx={{ fontSize: 40 }} />, color: '#1976d2', path: '/vfds', desc: 'Gestión de Variadores' },
    { title: 'Mantenimiento', icon: <Build sx={{ fontSize: 40 }} />, color: '#2e7d32', path: '/maintenance', desc: 'Registro de tareas' },
    { title: 'Inventario', icon: <Inventory sx={{ fontSize: 40 }} />, color: '#e65100', path: '/inventory', desc: 'Partes y repuestos' },
    { title: 'Reportes', icon: <Description sx={{ fontSize: 40 }} />, color: '#6a1b9a', path: '/reports', desc: 'Historial y PDFs' },
    { title: 'Configuración', icon: <Settings sx={{ fontSize: 40 }} />, color: '#00695c', path: '/settings', desc: 'Ajustes del sistema' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Cargando datos del Dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Encabezado */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight="800" color="primary">
            📊 Panel de Control
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Resumen del sistema y acceso a módulos
          </Typography>
        </Box>
      </Box>

      {/* GRID DE TARJETAS DE NAVEGACIÓN (El nuevo menú) */}
      <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mt: 4, mb: 2 }}>
        🚀 Acceso Rápido
      </Typography>
      <Grid container spacing={3} mb={4}>
        {navCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.title}>
            <Card 
              sx={{ 
                borderRadius: 4, 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid #e0e0e0',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                  borderColor: card.color
                }
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: card.color, width: 70, height: 70, mb: 2 }}>
                  {card.icon}
                </Avatar>
                <Typography variant="h6" fontWeight="700">{card.title}</Typography>
                <Typography variant="body2" color="textSecondary">{card.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ESTADÍSTICAS (Métricas del sistema) */}
      <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mt: 4, mb: 2 }}>
        📈 Estadísticas
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="caption" color="textSecondary">Total VSDs</Typography>
            <Typography variant="h3" fontWeight="700">{stats.total}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="caption" color="textSecondary">Online</Typography>
            <Typography variant="h3" fontWeight="700" color="success.main">{stats.online}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="caption" color="textSecondary">Offline / Alarma</Typography>
            <Typography variant="h3" fontWeight="700" color="error.main">{stats.offline + stats.alarm}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="caption" color="textSecondary">Health Score</Typography>
            <Typography variant="h3" fontWeight="700" color={stats.avgHealthScore > 80 ? 'success.main' : 'warning.main'}>
              {stats.avgHealthScore}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
