import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, useTheme, useMediaQuery, Snackbar, Alert,
  Tabs, Tab, Divider, Paper
} from '@mui/material';
import {
  Add, Refresh, Edit, Delete, Search, Print,
  CheckCircle, Cancel, Schedule, Build,
  PhotoCamera, Description, Download
} from '@mui/icons-material';
import { vfds } from '../api/endpoints';
import api from '../api/client';

const API_URL = 'http://localhost:5000/api';

const MaintenanceReports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [reports, setReports] = useState([]);
  const [vfdsList, setVfdsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    vfd_id: '',
    report_date: '',
    report_time: '',
    company: '',
    location: '',
    base: '',
    area: '',
    process: '',
    well: '',
    service_ticket: '',
    maintenance_type: 'Preventivo',
    vsd_brand: '',
    vsd_model: '',
    vsd_serial: '',
    vsd_kva: '',
    vsd_amps: '',
    sut_brand: '',
    sut_model: '',
    sut_serial: '',
    sut_kva: '',
    sut_amps: '',
    checklist: [],
    static_tests: [],
    activities: '',
    parts_changed: [],
    conclusions: '',
    recommendations: '',
    technician_name: '',
    supervisor_name: '',
    status: 'draft'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reportsRes, vfdsRes] = await Promise.all([
        api.get('/maintenance-reports'),
        vfds.getAll()
      ]);
      setReports(reportsRes.data.data || []);
      setVfdsList(vfdsRes.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpen = (report = null) => {
    if (report) {
      setEditing(report);
      setFormData(report);
    } else {
      setEditing(null);
      setFormData({
        vfd_id: '',
        report_date: new Date().toISOString().split('T')[0],
        report_time: new Date().toTimeString().slice(0,5),
        company: '',
        location: '',
        base: '',
        area: '',
        process: '',
        well: '',
        service_ticket: '',
        maintenance_type: 'Preventivo',
        vsd_brand: '',
        vsd_model: '',
        vsd_serial: '',
        vsd_kva: '',
        vsd_amps: '',
        sut_brand: '',
        sut_model: '',
        sut_serial: '',
        sut_kva: '',
        sut_amps: '',
        checklist: [],
        static_tests: [],
        activities: '',
        parts_changed: [],
        conclusions: '',
        recommendations: '',
        technician_name: '',
        supervisor_name: '',
        status: 'draft'
      });
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditing(null);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/maintenance-reports/${editing.id}`, formData);
        showSnackbar('✅ Reporte actualizado');
      } else {
        await api.post('/maintenance-reports', formData);
        showSnackbar('✅ Reporte creado');
      }
      handleClose();
      loadData();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este reporte?')) {
      try {
        await api.delete(`/maintenance-reports/${id}`);
        showSnackbar('✅ Reporte eliminado');
        loadData();
      } catch (error) {
        showSnackbar('Error al eliminar', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'approved': return theme.palette.primary.main;
      case 'draft': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'approved': return 'Aprobado';
      case 'draft': return 'Borrador';
      default: return status;
    }
  };

  const getVFDLabel = (vfdId) => {
    const vfd = vfdsList.find(v => v.id === vfdId);
    return vfd ? vfd.equipment_id : vfdId;
  };

  const filteredReports = tabValue === 0 
    ? reports 
    : reports.filter(r => {
        if (tabValue === 1) return r.status === 'draft';
        if (tabValue === 2) return r.status === 'completed';
        if (tabValue === 3) return r.status === 'approved';
        return true;
      });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Cargando reportes...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2} mb={3}>
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" className="gradient-text">
            📋 Reportes de Mantenimiento
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gestión de reportes completos de mantenimiento VFD
          </Typography>
        </Box>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{ borderRadius: 3 }}
            size={isMobile ? "small" : "medium"}
          >
            {isMobile ? 'Nuevo' : 'Nuevo Reporte'}
          </Button>
          <IconButton onClick={loadData} sx={{ bgcolor: 'rgba(108,99,255,0.1)' }}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Todos" />
        <Tab label="Borradores" />
        <Tab label="Completados" />
        <Tab label="Aprobados" />
      </Tabs>

      {/* Lista de reportes */}
      <Grid container spacing={3}>
        {filteredReports.map((report) => (
          <Grid item xs={12} md={6} lg={4} key={report.id}>
            <Card sx={{ borderRadius: 4, transition: 'all 0.3s ease' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      {report.report_number}
                    </Typography>
                    <Typography variant="h6" fontWeight="700">
                      {getVFDLabel(report.vfd_id)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {report.well || 'Sin pozo'}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(report.status)}
                    size="small"
                    sx={{
                      bgcolor: `${getStatusColor(report.status)}20`,
                      color: getStatusColor(report.status),
                      fontWeight: 600
                    }}
                  />
                </Box>

                <Box mt={2}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Fecha</Typography>
                      <Typography variant="body2">{report.report_date || '--'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Tipo</Typography>
                      <Typography variant="body2">{report.maintenance_type || '--'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">VSD</Typography>
                      <Typography variant="body2">{report.vsd_brand || '--'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Técnico</Typography>
                      <Typography variant="body2">{report.technician_name || '--'}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                  <Button
                    size="small"
                    startIcon={<Description />}
                    onClick={() => window.open(`/report/${report.id}`, '_blank')}
                  >
                    Ver
                  </Button>
                  <IconButton size="small" onClick={() => handleOpen(report)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(report.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredReports.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No hay reportes de mantenimiento
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialog - Formulario completo */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="700">
            {editing ? '✏️ Editar Reporte' : '📋 Nuevo Reporte de Mantenimiento'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Datos Generales */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" color="primary">
                📌 Datos Generales
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>VFD</InputLabel>
                <Select
                  value={formData.vfd_id}
                  onChange={(e) => setFormData({...formData, vfd_id: e.target.value})}
                  label="VFD"
                >
                  {vfdsList.map((vfd) => (
                    <MenuItem key={vfd.id} value={vfd.id}>
                      {vfd.equipment_id} - {vfd.manufacturer}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Mantenimiento</InputLabel>
                <Select
                  value={formData.maintenance_type}
                  onChange={(e) => setFormData({...formData, maintenance_type: e.target.value})}
                  label="Tipo de Mantenimiento"
                >
                  <MenuItem value="Preventivo">Preventivo</MenuItem>
                  <MenuItem value="Correctivo">Correctivo</MenuItem>
                  <MenuItem value="Predictivo">Predictivo</MenuItem>
                  <MenuItem value="Emergencia">Emergencia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha"
                type="date"
                value={formData.report_date}
                onChange={(e) => setFormData({...formData, report_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hora"
                type="time"
                value={formData.report_time}
                onChange={(e) => setFormData({...formData, report_time: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Compañía"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Locación"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Pozo"
                value={formData.well}
                onChange={(e) => setFormData({...formData, well: e.target.value})}
              />
            </Grid>

            {/* Datos del VSD */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" color="secondary" sx={{ mt: 1 }}>
                ⚡ Datos del VSD
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Marca VSD"
                value={formData.vsd_brand}
                onChange={(e) => setFormData({...formData, vsd_brand: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Modelo VSD"
                value={formData.vsd_model}
                onChange={(e) => setFormData({...formData, vsd_model: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Serial VSD"
                value={formData.vsd_serial}
                onChange={(e) => setFormData({...formData, vsd_serial: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="KVA VSD"
                type="number"
                value={formData.vsd_kva}
                onChange={(e) => setFormData({...formData, vsd_kva: parseFloat(e.target.value)})}
              />
            </Grid>

            {/* Datos del SUT */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" color="secondary" sx={{ mt: 1 }}>
                🔌 Datos del SUT (Transformador)
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Marca SUT"
                value={formData.sut_brand}
                onChange={(e) => setFormData({...formData, sut_brand: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Modelo SUT"
                value={formData.sut_model}
                onChange={(e) => setFormData({...formData, sut_model: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Serial SUT"
                value={formData.sut_serial}
                onChange={(e) => setFormData({...formData, sut_serial: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="KVA SUT"
                type="number"
                value={formData.sut_kva}
                onChange={(e) => setFormData({...formData, sut_kva: parseFloat(e.target.value)})}
              />
            </Grid>

            {/* Actividades */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" color="info" sx={{ mt: 1 }}>
                📝 Actividades Realizadas
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Actividades Realizadas"
                multiline
                rows={4}
                value={formData.activities}
                onChange={(e) => setFormData({...formData, activities: e.target.value})}
                placeholder="Describa las actividades realizadas durante el mantenimiento..."
              />
            </Grid>

            {/* Conclusiones */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" color="info" sx={{ mt: 1 }}>
                📋 Conclusiones y Recomendaciones
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Conclusiones"
                multiline
                rows={2}
                value={formData.conclusions}
                onChange={(e) => setFormData({...formData, conclusions: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recomendaciones"
                multiline
                rows={2}
                value={formData.recommendations}
                onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
              />
            </Grid>

            {/* Técnico */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" sx={{ mt: 1 }}>
                👤 Responsables
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre del Técnico"
                value={formData.technician_name}
                onChange={(e) => setFormData({...formData, technician_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre del Supervisor"
                value={formData.supervisor_name}
                onChange={(e) => setFormData({...formData, supervisor_name: e.target.value})}
              />
            </Grid>

            {/* Estado */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  label="Estado"
                >
                  <MenuItem value="draft">Borrador</MenuItem>
                  <MenuItem value="completed">Completado</MenuItem>
                  <MenuItem value="approved">Aprobado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MaintenanceReports;
