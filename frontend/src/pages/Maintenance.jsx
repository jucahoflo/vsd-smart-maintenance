import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, useTheme, useMediaQuery, Snackbar, Alert,
  Tabs, Tab, LinearProgress, CircularProgress
} from '@mui/material';
import {
  Add, Refresh, Edit, Delete, CheckCircle, Cancel, Schedule,
  Build, Person
} from '@mui/icons-material';
import { supabase } from '../config/supabase';

const Maintenance = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searching, setSearching] = useState(false);
  const [vfdEncontrado, setVfdEncontrado] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0
  });
  const [formData, setFormData] = useState({
    vfd_codigo: '',
    vfd_id: '',
    type: 'preventive',
    priority: 'medium',
    scheduled_date: '',
    description: '',
    technician: '',
    cost: '',
    observations: '',
    fecha_registro: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: recordsData, error } = await supabase
        .from('maintenance_records')
        .select('*, vfds(equipment_id_simple, manufacturer, model)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(recordsData || []);
      
      const total = recordsData?.length || 0;
      const completed = recordsData?.filter(r => r.status === 'completed').length || 0;
      const pending = recordsData?.filter(r => r.status === 'pending').length || 0;
      setStats({
        total,
        completed,
        pending,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      });
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

  // ✅ FUNCIONES DE COLOR
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'pending': return theme.palette.warning.main;
      case 'in_progress': return theme.palette.info.main;
      case 'cancelled': return theme.palette.error.main;
      default: return theme.palette.grey[500];
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
      default: return theme.palette.grey[500];
    }
  };

  const buscarVFDporCodigo = async (codigo) => {
    if (!codigo || codigo.length < 2) {
      setVfdEncontrado(null);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('vfds')
        .select('*')
        .eq('equipment_id_simple', codigo.toUpperCase())
        .single();

      if (error) {
        setVfdEncontrado(null);
        setFormData(prev => ({ ...prev, vfd_id: '', vfd_codigo: '' }));
        showSnackbar(`❌ No se encontró VFD con código ${codigo}`, 'warning');
      } else if (data) {
        setVfdEncontrado(data);
        setFormData(prev => ({ 
          ...prev, 
          vfd_id: data.id,
          vfd_codigo: data.equipment_id_simple 
        }));
        showSnackbar(`✅ VFD encontrado: ${data.equipment_id_simple} - ${data.manufacturer || 'Sin fabricante'}`, 'success');
      }
    } catch (error) {
      console.error('Error buscando VFD:', error);
      setVfdEncontrado(null);
      setFormData(prev => ({ ...prev, vfd_id: '', vfd_codigo: '' }));
      showSnackbar(`❌ No se encontró VFD con código ${codigo}`, 'warning');
    } finally {
      setSearching(false);
    }
  };

  const handleOpen = (record = null) => {
    if (record) {
      setEditing(record);
      setFormData({
        vfd_codigo: record.vfd_codigo || '',
        vfd_id: record.vfd_id || '',
        type: record.type,
        priority: record.priority,
        scheduled_date: record.scheduled_date || '',
        description: record.description || '',
        technician: record.technician || '',
        cost: record.cost || '',
        observations: record.observations || '',
        fecha_registro: record.fecha_registro || new Date().toISOString().split('T')[0]
      });
      if (record.vfd_codigo) {
        buscarVFDporCodigo(record.vfd_codigo);
      }
    } else {
      setEditing(null);
      setFormData({
        vfd_codigo: '',
        vfd_id: '',
        type: 'preventive',
        priority: 'medium',
        scheduled_date: new Date().toISOString().split('T')[0],
        description: '',
        technician: '',
        cost: '',
        observations: '',
        fecha_registro: new Date().toISOString().split('T')[0]
      });
      setVfdEncontrado(null);
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditing(null);
    setVfdEncontrado(null);
  };

  const handleSave = async () => {
    try {
      if (!formData.vfd_id) {
        showSnackbar('❌ Primero busca y selecciona un VFD válido', 'error');
        return;
      }

      const dataToSend = {
        vfd_id: formData.vfd_id,
        vfd_codigo: formData.vfd_codigo,
        type: formData.type,
        priority: formData.priority,
        scheduled_date: formData.scheduled_date,
        description: formData.description,
        technician: formData.technician,
        cost: parseFloat(formData.cost) || 0,
        observations: formData.observations,
        fecha_registro: formData.fecha_registro || new Date().toISOString().split('T')[0]
      };

      if (editing) {
        const { error } = await supabase
          .from('maintenance_records')
          .update(dataToSend)
          .eq('id', editing.id);
        if (error) throw error;
        showSnackbar('✅ Mantenimiento actualizado');
      } else {
        const { error } = await supabase
          .from('maintenance_records')
          .insert([dataToSend]);
        if (error) throw error;
        showSnackbar('✅ Mantenimiento programado');
      }
      handleClose();
      loadData();
    } catch (error) {
      showSnackbar(error.message || 'Error al guardar', 'error');
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm('¿Completar este mantenimiento?')) {
      try {
        const { error } = await supabase
          .from('maintenance_records')
          .update({ status: 'completed', completed_date: new Date().toISOString().split('T')[0] })
          .eq('id', id);
        if (error) throw error;
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
        const { error } = await supabase
          .from('maintenance_records')
          .delete()
          .eq('id', id);
        if (error) throw error;
        showSnackbar('✅ Mantenimiento eliminado');
        loadData();
      } catch (error) {
        showSnackbar('Error al eliminar', 'error');
      }
    }
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
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ borderRadius: 3 }} size={isMobile ? "small" : "medium"}>
            {isMobile ? 'Nuevo' : 'Nuevo Mantenimiento'}
          </Button>
          <IconButton onClick={loadData} sx={{ bgcolor: 'rgba(108,99,255,0.1)' }}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

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
              <LinearProgress variant="determinate" value={stats.completionRate || 0} sx={{ height: 4, borderRadius: 2, mt: 0.5 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Todos" />
        <Tab label="Pendientes" />
        <Tab label="En Progreso" />
        <Tab label="Completados" />
      </Tabs>

      <Grid container spacing={3}>
        {filteredRecords.map((record) => (
          <Grid item xs={12} md={6} lg={4} key={record.id}>
            <Card sx={{ borderRadius: 4, transition: 'all 0.3s ease' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="h6" fontWeight="700">
                      {record.vfd_codigo || 'Sin código'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {record.type} • {record.priority}
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
                  {record.fecha_registro && (
                    <Typography variant="caption" color="textSecondary" display="block">
                      🗓️ Registro: {new Date(record.fecha_registro).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>

                <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                  {record.status !== 'completed' && (
                    <Button size="small" color="success" startIcon={<CheckCircle />} onClick={() => handleComplete(record.id)}>
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
              <Typography variant="h6" color="textSecondary">No hay mantenimientos registrados</Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="700">
            {editing ? '✏️ Editar Mantenimiento' : '➕ Nuevo Mantenimiento'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Box display="flex" gap={1} alignItems="center">
                <TextField
                  fullWidth
                  label="🔑 Código del VFD (ej: V001)"
                  value={formData.vfd_codigo}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setFormData({...formData, vfd_codigo: value});
                    if (value.length >= 2) {
                      buscarVFDporCodigo(value);
                    }
                  }}
                  placeholder="Ingresa el código del VFD"
                  helperText={vfdEncontrado ? `✅ ${vfdEncontrado.equipment_id_simple} - ${vfdEncontrado.manufacturer || 'Sin fabricante'}` : 'Ej: V001, V002'}
                  disabled={searching}
                />
                {searching && <CircularProgress size={24} />}
              </Box>
              {vfdEncontrado && (
                <Box mt={1} p={1} bgcolor="success.light" borderRadius={1}>
                  <Typography variant="body2">
                    📌 {vfdEncontrado.equipment_id_simple} - {vfdEncontrado.manufacturer || 'Sin fabricante'} {vfdEncontrado.model || ''}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} label="Tipo">
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
                <Select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} label="Prioridad">
                  <MenuItem value="low">Baja</MenuItem>
                  <MenuItem value="medium">Media</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="critical">Crítica</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Fecha Programada" type="date" value={formData.scheduled_date} onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Descripción" multiline rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Técnico" value={formData.technician} onChange={(e) => setFormData({...formData, technician: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Costo ($)" type="number" value={formData.cost} onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Observaciones" multiline rows={2} value={formData.observations} onChange={(e) => setFormData({...formData, observations: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!vfdEncontrado}>
            {editing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Maintenance;
