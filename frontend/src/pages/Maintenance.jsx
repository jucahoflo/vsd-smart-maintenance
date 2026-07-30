import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, useTheme, useMediaQuery, Snackbar, Alert,
  LinearProgress, Avatar, Tabs, Tab
} from '@mui/material';
import {
  Add, Refresh, CheckCircle, Cancel, Edit, Delete,
  Build, Warning, Check, Schedule, Person
} from '@mui/icons-material';
import { maintenance, vfds } from '../api/endpoints';

const Maintenance = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [records, setRecords] = useState([]);
  const [vfdsList, setVfdsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    completionRate: 0,
    byType: {},
    byPriority: {}
  });
  const [formData, setFormData] = useState({
    vfd_id: '',
    type: 'preventive',
    priority: 'medium',
    scheduled_date: '',
    description: '',
    technician: '',
    cost: '',
    parts_used: [],
    observations: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recordsRes, vfdsRes, statsRes] = await Promise.all([
        maintenance.getAll(),
        vfds.getAll(),
        maintenance.getStats()
      ]);
      setRecords(recordsRes.data.data || []);
      setVfdsList(vfdsRes.data.data || []);
      setStats(statsRes.data.data || {});
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

  const handleOpen = (record = null) => {
    if (record) {
      setEditing(record);
      setFormData({
        vfd_id: record.vfd_id,
        type: record.type,
        priority: record.priority,
        scheduled_date: record.scheduled_date || '',
        description: record.description || '',
        technician: record.technician || '',
        cost: record.cost || '',
        parts_used: record.parts_used || [],
        observations: record.observations || ''
      });
    } else {
      setEditing(null);
      setFormData({
        vfd_id: '',
        type: 'preventive',
        priority: 'medium',
        scheduled_date: new Date().toISOString().split('T')[0],
        description: '',
        technician: '',
        cost: '',
        parts_used: [],
        observations: ''
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
        await maintenance.update(editing.id, formData);
        showSnackbar('✅ Mantenimiento actualizado');
      } else {
        await maintenance.create(formData);
        showSnackbar('✅ Mantenimiento programado');
      }
      handleClose();
      loadData();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error al guardar', 'error');
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm('¿Completar este mantenimiento?')) {
      try {
        await maintenance.complete(id, {
          observations: 'Mantenimiento completado',
          hours_used: 2,
          cost: 0
        });
        showSnackbar('✅ Mantenimiento completado');
        loadData();
      } catch (error) {
        showSnackbar('Error al completar', 'error');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este mantenimiento?')) {
      try {
        await maintenance.delete(id);
        showSnackbar('✅ Mantenimiento eliminado');
        loadData();
      } catch (error) {
        showSnackbar('Error al eliminar', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'pending': return theme.palette.warning.main;
      case 'in_progress': return theme.palette.info.main;
      case 'cancelled': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle sx={{ color: '#00B894' }} />;
      case 'pending': return <Schedule sx={{ color: '#FDCB6E' }} />;
      case 'in_progress': return <Build sx={{ color: '#74B9FF' }} />;
      case 'cancelled': return <Cancel sx={{ color: '#FF6B6B' }} />;
      default: return <Build />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'preventive': return theme.palette.info.main;
      case 'predictive': return theme.palette.secondary.main;
      case 'corrective': return theme.palette.warning.main;
      case 'emergency': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      case 'critical': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getVFDLabel = (vfdId) => {
    const vfd = vfdsList.find(v => v.id === vfdId);
    return vfd ? vfd.equipment_id : vfdId;
  };

  const filteredRecords = tabValue === 0 
    ? records 
    : records.filter(r => {
        if (tabValue === 1) return r.status === 'pending';
        if (tabValue === 2) return r.status === 'in_progress';
        if (tabValue === 3) return r.status === 'completed';
        return true;
      });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Cargando mantenimientos...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2} mb={3}>
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" className="gradient-text">
            🔧 Mantenimiento
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gestión de mantenimientos de VFDs
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
            {isMobile ? 'Nuevo' : 'Nuevo Mantenimiento'}
          </Button>
          <IconButton onClick={loadData} sx={{ bgcolor: 'rgba(108,99,255,0.1)' }}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={isMobile ? 1 : 3} mb={3}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, p: isMobile ? 1 : 2 }}>
            <CardContent sx={{ p: isMobile ? 1 : 2 }}>
              <Typography variant="caption" color="textSecondary">Total</Typography>
              <Typography variant="h5" fontWeight="700">{stats.total || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, p: isMobile ? 1 : 2, border: '2px solid #4caf50' }}>
            <CardContent sx={{ p: isMobile ? 1 : 2 }}>
              <Typography variant="caption" color="textSecondary">Completados</Typography>
              <Typography variant="h5" fontWeight="700" color="success.main">{stats.completed || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, p: isMobile ? 1 : 2, border: '2px solid #ff9800' }}>
            <CardContent sx={{ p: isMobile ? 1 : 2 }}>
              <Typography variant="caption" color="textSecondary">Pendientes</Typography>
              <Typography variant="h5" fontWeight="700" color="warning.main">{stats.pending || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, p: isMobile ? 1 : 2 }}>
            <CardContent sx={{ p: isMobile ? 1 : 2 }}>
              <Typography variant="caption" color="textSecondary">Completitud</Typography>
              <Typography variant="h5" fontWeight="700">{stats.completionRate || 0}%</Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.completionRate || 0} 
                sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Todos" />
        <Tab label="Pendientes" />
        <Tab label="En Progreso" />
        <Tab label="Completados" />
      </Tabs>

      {/* Lista de mantenimientos */}
      <Grid container spacing={3}>
        {filteredRecords.map((record) => (
          <Grid item xs={12} md={6} lg={4} key={record.id}>
            <Card sx={{ 
              borderRadius: 4,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: isMobile ? 'none' : 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="h6" fontWeight="700">
                      {getVFDLabel(record.vfd_id)}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                      <Chip
                        label={record.type}
                        size="small"
                        sx={{
                          bgcolor: `${getTypeColor(record.type)}20`,
                          color: getTypeColor(record.type),
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                      <Chip
                        label={record.priority}
                        size="small"
                        sx={{
                          bgcolor: `${getPriorityColor(record.priority)}20`,
                          color: getPriorityColor(record.priority),
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                      <Chip
                        icon={getStatusIcon(record.status)}
                        label={record.status}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(record.status)}20`,
                          color: getStatusColor(record.status),
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                    {record.description || 'Sin descripción'}
                  </Typography>
                  {record.technician && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{record.technician}</Typography>
                    </Box>
                  )}
                  {record.scheduled_date && (
                    <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
                      📅 {new Date(record.scheduled_date).toLocaleDateString()}
                    </Typography>
                  )}
                  {record.cost > 0 && (
                    <Typography variant="caption" color="textSecondary" display="block">
                      💰 ${record.cost}
                    </Typography>
                  )}
                </Box>

                <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                  {record.status !== 'completed' && (
                    <Button
                      size="small"
                      color="success"
                      startIcon={<Check />}
                      onClick={() => handleComplete(record.id)}
                    >
                      Completar
                    </Button>
                  )}
                  <IconButton size="small" onClick={() => handleOpen(record)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(record.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredRecords.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No hay mantenimientos registrados
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="700">
            {editing ? '✏️ Editar Mantenimiento' : '➕ Nuevo Mantenimiento'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
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
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  label="Tipo"
                >
                  <MenuItem value="preventive">Preventivo</MenuItem>
                  <MenuItem value="predictive">Predictivo</MenuItem>
                  <MenuItem value="corrective">Correctivo</MenuItem>
                  <MenuItem value="emergency">Emergencia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  label="Prioridad"
                >
                  <MenuItem value="low">Baja</MenuItem>
                  <MenuItem value="medium">Media</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="critical">Crítica</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fecha Programada"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Técnico"
                value={formData.technician}
                onChange={(e) => setFormData({...formData, technician: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Costo ($)"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                multiline
                rows={2}
                value={formData.observations}
                onChange={(e) => setFormData({...formData, observations: e.target.value})}
              />
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

export default Maintenance;
