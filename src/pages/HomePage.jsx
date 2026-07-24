import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  Typography,
  CardActionArea,
  Avatar,
  Paper,
  Chip,
  LinearProgress,
  Stack,
  Divider
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { useVSD } from '../context/VSDContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const HomePage = () => {
  const navigate = useNavigate();
  const { getVSDStats, vsds, maintenances } = useVSD();
  const stats = getVSDStats();

  const doughnutData = {
    labels: ['Activos', 'En Mantenimiento', 'Inactivos'],
    datasets: [
      {
        data: [stats.activos || 0, stats.mantenimiento || 0, stats.inactivos || 0],
        backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: ['Pendientes', 'En Progreso', 'Completados', 'Cancelados'],
    datasets: [
      {
        label: 'Mantenimientos',
        data: [
          stats.mantenimientos?.pendientes || 0,
          stats.mantenimientos?.en_progreso || 0,
          stats.mantenimientos?.completados || 0,
          stats.mantenimientos?.cancelados || 0,
        ],
        backgroundColor: ['#eab308', '#3b82f6', '#22c55e', '#6b7280'],
        borderRadius: 8,
      },
    ],
  };

  const menuItems = [
    { id: 'dashboard', title: 'Dashboard', icon: <DashboardIcon sx={{ fontSize: 40 }} />, color: '#0284c7', bgColor: '#e0f2fe', path: '/' },
    { id: 'vsds', title: 'VSDs', icon: <SpeedIcon sx={{ fontSize: 40 }} />, color: '#0284c7', bgColor: '#e0f2fe', path: '/vsds' },
    { id: 'maintenance', title: 'Mantenimiento', icon: <BuildIcon sx={{ fontSize: 40 }} />, color: '#7c3aed', bgColor: '#ede9fe', path: '/maintenance' },
    { id: 'inventory', title: 'Inventario', icon: <InventoryIcon sx={{ fontSize: 40 }} />, color: '#22c55e', bgColor: '#dcfce7', path: '/inventory' },
    { id: 'reports', title: 'Reportes', icon: <AssessmentIcon sx={{ fontSize: 40 }} />, color: '#eab308', bgColor: '#fef3c7', path: '/reports' },
    { id: 'settings', title: 'Configuración', icon: <SettingsIcon sx={{ fontSize: 40 }} />, color: '#6b7280', bgColor: '#f3f4f6', path: '/settings' }
  ];

  const QuickStatCard = ({ title, value, icon, color }) => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="h-full">
      <Card className="card-hover" sx={{ height: '100%', borderRadius: 3 }}>
        <CardActionArea sx={{ p: 2, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: color + '20', color: color, width: 48, height: 48, mx: 'auto', mb: 1 }}>
            {icon}
          </Avatar>
          <Typography variant="h4" fontWeight="bold">{value}</Typography>
          <Typography variant="caption" color="textSecondary">{title}</Typography>
        </CardActionArea>
      </Card>
    </motion.div>
  );

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" className="text-gray-800">
          Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} sm={3}>
          <QuickStatCard title="Total VSDs" value={stats.total || 0} icon={<SpeedIcon />} color="#0284c7" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <QuickStatCard title="Mantenimientos" value={stats.mantenimientos?.total || 0} icon={<BuildIcon />} color="#7c3aed" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <QuickStatCard title="Partes" value={stats.partes || 0} icon={<InventoryIcon />} color="#22c55e" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <QuickStatCard title="Completados" value={stats.mantenimientos?.completados || 0} icon={<CheckCircleIcon />} color="#22c55e" />
        </Grid>
      </Grid>

      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        📋 Menú Principal
      </Typography>
      
      <Grid container spacing={3} mb={4}>
        {menuItems.map((item) => (
          <Grid item xs={6} sm={4} md={2} key={item.id}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full">
              <Card className="card-hover" sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: item.bgColor }}>
                <CardActionArea onClick={() => navigate(item.path)} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: item.bgColor, color: item.color, mb: 1 }}>
                    {item.icon}
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight="bold" align="center">
                    {item.title}
                  </Typography>
                </CardActionArea>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        📊 Estadísticas Visuales
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper className="p-4" sx={{ borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Estado de VSDs
            </Typography>
            <Box display="flex" justifyContent="center">
              <Box sx={{ width: 250, height: 250 }}>
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' } } } }} />
              </Box>
            </Box>
            <Box display="flex" justifyContent="center" gap={3} mt={2}>
              <Box textAlign="center"><Typography variant="h6" color="#22c55e">{stats.activos || 0}</Typography><Typography variant="caption" color="textSecondary">Activos</Typography></Box>
              <Box textAlign="center"><Typography variant="h6" color="#eab308">{stats.mantenimiento || 0}</Typography><Typography variant="caption" color="textSecondary">Mantenimiento</Typography></Box>
              <Box textAlign="center"><Typography variant="h6" color="#ef4444">{stats.inactivos || 0}</Typography><Typography variant="caption" color="textSecondary">Inactivos</Typography></Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="p-4" sx={{ borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Mantenimientos por Estado
            </Typography>
            <Box sx={{ height: 250 }}>
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          🔄 Actividad Reciente
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper className="p-4" sx={{ borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Últimos VSDs
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {vsds.length === 0 ? (
                <Typography variant="body2" color="textSecondary">No hay VSDs registrados</Typography>
              ) : (
                <Stack spacing={1}>
                  {vsds.slice(0, 5).map((vsd) => (
                    <Box key={vsd._id} display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' }, cursor: 'pointer' }} onClick={() => navigate('/vsds')}>
                      <Box><Typography variant="body2" fontWeight="500">{vsd.nombre}</Typography><Typography variant="caption" color="textSecondary">{vsd.marca} {vsd.modelo}</Typography></Box>
                      <Chip label={vsd.estado} size="small" color={vsd.estado === 'activo' ? 'success' : vsd.estado === 'mantenimiento' ? 'warning' : 'error'} />
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper className="p-4" sx={{ borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Mantenimientos Pendientes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {maintenances.filter(m => m.estado === 'pendiente').length === 0 ? (
                <Typography variant="body2" color="textSecondary">No hay mantenimientos pendientes</Typography>
              ) : (
                <Stack spacing={1}>
                  {maintenances.filter(m => m.estado === 'pendiente').slice(0, 5).map((m) => (
                    <Box key={m._id} display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' }, cursor: 'pointer' }} onClick={() => navigate('/maintenance')}>
                      <Box><Typography variant="body2" fontWeight="500">{m.titulo}</Typography><Typography variant="caption" color="textSecondary">{m.tipo} • {m.tecnico || 'Sin técnico'}</Typography></Box>
                      <Chip label={m.prioridad} size="small" color={m.prioridad === 'critica' ? 'error' : m.prioridad === 'alta' ? 'warning' : 'default'} />
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* ============ FOOTER PROFESIONAL ============ */}
      <Box 
        component="footer" 
        sx={{ 
          mt: 6, 
          pt: 4, 
          pb: 3, 
          borderTop: '2px solid',
          borderColor: 'divider',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Línea decorativa */}
        <Box 
          sx={{
            position: 'absolute',
            top: -2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 80,
            height: 3,
            bgcolor: 'primary.main',
            borderRadius: 2
          }}
        />

        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          {/* Icono de código */}
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: 'primary.main', 
              color: 'white',
              mb: 1
            }}
          >
            <CodeIcon />
          </Avatar>

          <Typography variant="caption" color="textSecondary" sx={{ letterSpacing: 1 }}>
            DESARROLLADO POR
          </Typography>
          
          <Typography variant="h6" fontWeight="bold" color="primary" sx={{ letterSpacing: 0.5 }}>
            JUAN CARLOS HOLGUIN F.
          </Typography>
          
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
            Frontend Developer & Software Engineer
          </Typography>
          
          <Box 
            display="flex" 
            gap={2} 
            mt={1.5}
            sx={{
              '& .MuiChip-root': {
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }
            }}
          >
            <Chip
              icon={<GitHubIcon sx={{ fontSize: 16 }} />}
              label="GitHub"
              size="small"
              component="a"
              href="https://github.com/juank2309"
              target="_blank"
              rel="noopener noreferrer"
              clickable
              sx={{ 
                cursor: 'pointer',
                bgcolor: '#24292e',
                color: 'white',
                '&:hover': { bgcolor: '#1a1e22' },
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            <Chip
              icon={<LinkedInIcon sx={{ fontSize: 16 }} />}
              label="LinkedIn"
              size="small"
              component="a"
              href="https://linkedin.com/in/juan-carlos-holguin-fernandez-a73564329/"
              target="_blank"
              rel="noopener noreferrer"
              clickable
              sx={{ 
                cursor: 'pointer',
                bgcolor: '#0A66C2',
                color: 'white',
                '&:hover': { bgcolor: '#084a8f' },
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            <Chip
              icon={<CodeIcon sx={{ fontSize: 16 }} />}
              label="Portafolio"
              size="small"
              component="a"
              href="https://juanch23.github.io/Portafolio/"
              target="_blank"
              rel="noopener noreferrer"
              clickable
              sx={{ 
                cursor: 'pointer',
                bgcolor: '#6b21a8',
                color: 'white',
                '&:hover': { bgcolor: '#581c87' },
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          </Box>
          
          <Divider sx={{ width: '100%', maxWidth: 400, my: 2 }} />
          
          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
            © 2026 VSD Smart Maintenance - Todos los derechos reservados
          </Typography>
          
          <Box display="flex" gap={3} justifyContent="center">
            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.6rem', opacity: 0.6 }}>
              v1.0.0
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.6rem', opacity: 0.6 }}>
              •
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.6rem', opacity: 0.6 }}>
              Modo Offline Disponible
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.6rem', opacity: 0.6 }}>
              •
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.6rem', opacity: 0.6 }}>
              React + IndexedDB
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;