import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  Fab
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { useVSD } from '../context/VSDContext';
import ReportGenerator from '../components/reports/ReportGenerator';

const ReportsPage = () => {
  const { getVSDStats } = useVSD();
  const stats = getVSDStats();
  const [openReportGenerator, setOpenReportGenerator] = useState(false);

  const StatCard = ({ title, value, icon, color }) => (
    <Card className="card-hover">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption" color="textSecondary">{title}</Typography>
            <Typography variant="h4" fontWeight="bold">{value}</Typography>
          </Box>
          <Box sx={{ bgcolor: color + '20', borderRadius: 2, p: 1, color: color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" fontWeight="bold">
          Reportes y Estadísticas
        </Typography>
        <Fab 
          variant="extended" 
          color="primary"
          onClick={() => setOpenReportGenerator(true)}
        >
          <PdfIcon sx={{ mr: 1 }} />
          Generar Reporte PDF
        </Fab>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} sm={3}>
          <StatCard title="Total VSDs" value={stats.total} icon={<SpeedIcon />} color="#0284c7" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Mantenimientos" value={stats.mantenimientos.total} icon={<BuildIcon />} color="#7c3aed" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Partes" value={stats.partes} icon={<InventoryIcon />} color="#22c55e" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard 
            title="Completados" 
            value={`${Math.round((stats.mantenimientos.completados / (stats.mantenimientos.total || 1)) * 100)}%`} 
            icon={<CheckCircleIcon />} 
            color="#22c55e" 
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Estado de VSDs
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Activos</Typography>
                  <Typography variant="body2" fontWeight="bold">{stats.activos}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={(stats.activos / (stats.total || 1)) * 100} color="success" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">En Mantenimiento</Typography>
                  <Typography variant="body2" fontWeight="bold">{stats.mantenimiento}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={(stats.mantenimiento / (stats.total || 1)) * 100} color="warning" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Inactivos</Typography>
                  <Typography variant="body2" fontWeight="bold">{stats.inactivos}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={(stats.inactivos / (stats.total || 1)) * 100} color="error" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Mantenimientos por Estado
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Pendientes</Typography>
                  <Typography variant="body2" fontWeight="bold">{stats.mantenimientos.pendientes}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={(stats.mantenimientos.pendientes / (stats.mantenimientos.total || 1)) * 100} color="warning" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">En Progreso</Typography>
                  <Typography variant="body2" fontWeight="bold">{stats.mantenimientos.en_progreso}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={(stats.mantenimientos.en_progreso / (stats.mantenimientos.total || 1)) * 100} color="primary" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Completados</Typography>
                  <Typography variant="body2" fontWeight="bold">{stats.mantenimientos.completados}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={(stats.mantenimientos.completados / (stats.mantenimientos.total || 1)) * 100} color="success" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <ReportGenerator
        open={openReportGenerator}
        onClose={() => setOpenReportGenerator(false)}
      />
    </Box>
  );
};

export default ReportsPage;