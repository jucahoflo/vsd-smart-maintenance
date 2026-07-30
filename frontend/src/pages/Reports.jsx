import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button,
  Chip, useTheme, useMediaQuery, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Divider, IconButton, Paper
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Speed as SpeedIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  Print as PrintIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { vfds, maintenance, inventory } from '../api/endpoints';
import api from '../api/client';

const Reports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState({});
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [vfdsList, setVfdsList] = useState([]);
  const [stats, setStats] = useState({
    totalVFDs: 0,
    totalMaintenance: 0,
    totalInventory: 0,
    pendingMaintenance: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vfdsRes, maintenanceRes, inventoryRes, reportsRes] = await Promise.all([
        vfds.getAll(),
        maintenance.getAll(),
        inventory.getAll(),
        api.get('/maintenance-reports')
      ]);

      const vfdsData = vfdsRes.data.data || [];
      const maintenanceData = maintenanceRes.data.data || [];
      const inventoryData = inventoryRes.data.data || [];

      setVfdsList(vfdsData);
      setReports(reportsRes.data.data || []);

      setStats({
        totalVFDs: vfdsData.length,
        totalMaintenance: maintenanceData.length,
        totalInventory: inventoryData.length,
        pendingMaintenance: maintenanceData.filter(m => m.status === 'pending').length
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleOpenPreview = (report) => {
    setSelectedReport(report);
    setOpenPreview(true);
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
    setSelectedReport(null);
  };

  const ReportPreview = ({ report }) => {
    if (!report) return null;

    return (
      <Paper sx={{ p: 3, maxHeight: '80vh', overflow: 'auto' }}>
        {/* Encabezado */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="700" color="primary">
            REPORTE DE MANTENIMIENTO
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {report.report_number}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Datos Generales */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">Fecha</Typography>
            <Typography variant="body2">{report.report_date || '--'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">Hora</Typography>
            <Typography variant="body2">{report.report_time || '--'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">Compañía</Typography>
            <Typography variant="body2">{report.company || '--'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">Locación</Typography>
            <Typography variant="body2">{report.location || '--'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">Pozo</Typography>
            <Typography variant="body2">{report.well || '--'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">Tipo</Typography>
            <Chip
              label={report.maintenance_type || '--'}
              size="small"
              color={report.maintenance_type === 'Preventivo' ? 'success' : 'warning'}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Datos del VSD */}
        <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
          ⚡ Datos del VSD
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="caption" color="textSecondary">Marca</Typography>
            <Typography variant="body2">{report.vsd_brand || '--'}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" color="textSecondary">Modelo</Typography>
            <Typography variant="body2">{report.vsd_model || '--'}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" color="textSecondary">Serial</Typography>
            <Typography variant="body2">{report.vsd_serial || '--'}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" color="textSecondary">KVA</Typography>
            <Typography variant="body2">{report.vsd_kva || '--'}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Datos del SUT */}
        <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
          🔌 Datos del SUT (Transformador)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="caption" color="textSecondary">Marca</Typography>
            <Typography variant="body2">{report.sut_brand || '--'}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" color="textSecondary">Modelo</Typography>
            <Typography variant="body2">{report.sut_model || '--'}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" color="textSecondary">Serial</Typography>
            <Typography variant="body2">{report.sut_serial || '--'}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" color="textSecondary">KVA</Typography>
            <Typography variant="body2">{report.sut_kva || '--'}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Actividades */}
        <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
          📝 Actividades Realizadas
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {report.activities || 'No se registraron actividades'}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Conclusiones */}
        <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
          📋 Conclusiones
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {report.conclusions || 'No se registraron conclusiones'}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Recomendaciones */}
        <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
          💡 Recomendaciones
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {report.recommendations || 'No se registraron recomendaciones'}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Firmas */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">Técnico</Typography>
            <Typography variant="body2">{report.technician_name || '--'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">Supervisor</Typography>
            <Typography variant="body2">{report.supervisor_name || '--'}</Typography>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const ReportCard = ({ title, icon, color, count, subtitle, onGenerate }) => (
    <Card sx={{
      borderRadius: 4,
      p: 3,
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}25`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: isMobile ? 'none' : 'translateY(-4px)',
        boxShadow: `0 8px 16px ${color}25`
      }
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ bgcolor: `${color}20`, borderRadius: '50%', p: 1 }}>
              {icon}
            </Box>
            <Typography variant="h6" fontWeight="700">
              {title}
            </Typography>
          </Box>
          <Typography variant="h3" fontWeight="800" sx={{ color, mt: 1 }}>
            {count}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {subtitle}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={onGenerate}
          disabled={loading[title]}
          sx={{
            borderRadius: 3,
            bgcolor: color,
            '&:hover': { bgcolor: color, opacity: 0.8 }
          }}
        >
          {loading[title] ? <CircularProgress size={20} color="inherit" /> : 'PDF'}
        </Button>
      </Box>
    </Card>
  );

  return (
    <Box>
      <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" className="gradient-text" mb={1}>
        📊 Reportes
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={4}>
        Genera reportes en PDF de tus datos
      </Typography>

      {/* Tarjetas de Reportes */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <ReportCard
            title="VFDs"
            icon={<SpeedIcon sx={{ color: '#6C63FF' }} />}
            color="#6C63FF"
            count={stats.totalVFDs}
            subtitle="Variadores de velocidad"
            onGenerate={() => console.log('Generando reporte VFDs')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ReportCard
            title="Mantenimiento"
            icon={<BuildIcon sx={{ color: '#FF6B6B' }} />}
            color="#FF6B6B"
            count={stats.totalMaintenance}
            subtitle={`${stats.pendingMaintenance} pendientes`}
            onGenerate={() => console.log('Generando reporte Mantenimiento')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ReportCard
            title="Inventario"
            icon={<InventoryIcon sx={{ color: '#00B894' }} />}
            color="#00B894"
            count={stats.totalInventory}
            subtitle="Items en stock"
            onGenerate={() => console.log('Generando reporte Inventario')}
          />
        </Grid>
      </Grid>

      {/* Reportes de Mantenimiento Guardados */}
      <Typography variant="h5" fontWeight="700" mb={2}>
        📋 Reportes de Mantenimiento Guardados
      </Typography>

      <Grid container spacing={3}>
        {reports.slice(0, 6).map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report.id}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      {report.report_number}
                    </Typography>
                    <Typography variant="h6" fontWeight="700">
                      {report.well || 'Sin pozo'}
                    </Typography>
                  </Box>
                  <Chip
                    label={report.maintenance_type || '--'}
                    size="small"
                    color={report.maintenance_type === 'Preventivo' ? 'success' : 'warning'}
                  />
                </Box>

                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    {report.technician_name || 'Sin técnico'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    📅 {report.report_date || '--'}
                  </Typography>
                </Box>

                <Box mt={2} display="flex" gap={1}>
                  <Button
                    size="small"
                    startIcon={<DescriptionIcon />}
                    onClick={() => handleOpenPreview(report)}
                  >
                    Ver
                  </Button>
                  <Button
                    size="small"
                    startIcon={<PrintIcon />}
                  >
                    PDF
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {reports.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No hay reportes de mantenimiento guardados
              </Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                Ve a "Reportes Mant." para crear un nuevo reporte
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialog de vista previa */}
      <Dialog
        open={openPreview}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="700">
              📄 Reporte de Mantenimiento
            </Typography>
            <IconButton onClick={handleClosePreview}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <ReportPreview report={selectedReport} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Cerrar</Button>
          <Button variant="contained" startIcon={<PrintIcon />}>
            Imprimir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;
