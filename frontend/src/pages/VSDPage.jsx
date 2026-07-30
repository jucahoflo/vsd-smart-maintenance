import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button,
  TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Chip, Snackbar, Alert,
  CircularProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add, Refresh, Edit, Delete, Speed } from '@mui/icons-material';
import { supabase } from '../config/supabase';
import { crearVSD, actualizarVSD } from '../services/vsdService';

const VSDPage = () => {
  const [vfds, setVfds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    equipment_id_simple: '',
    manufacturer: '',
    model: '',
    status: 'online',
    health_score: 100
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vfds')
        .select('*')
        .order('equipment_id_simple', { ascending: true });

      if (error) throw error;
      setVfds(data || []);
    } catch (error) {
      console.error('❌ Error loading VSDs:', error);
      showSnackbar('Error al cargar VSDs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpen = (vfd = null) => {
    if (vfd) {
      setEditing(vfd);
      setFormData({
        equipment_id_simple: vfd.equipment_id_simple,
        manufacturer: vfd.manufacturer || '',
        model: vfd.model || '',
        status: vfd.status || 'online',
        health_score: vfd.health_score || 100
      });
    } else {
      setEditing(null);
      setFormData({
        equipment_id_simple: '',
        manufacturer: '',
        model: '',
        status: 'online',
        health_score: 100
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
        // Usar el código original que ya está en la base de datos
        const codigoOriginal = editing.equipment_id_simple;
        
        const dataToSend = {
          manufacturer: formData.manufacturer || '',
          model: formData.model || '',
          status: formData.status || 'online',
          health_score: parseInt(formData.health_score) || 100
        };

        console.log('📝 Actualizando VSD:', codigoOriginal);
        
        const { error } = await supabase
          .from('vfds')
          .update(dataToSend)
          .eq('id', editing.id);

        if (error) throw error;
        showSnackbar('✅ VSD actualizado correctamente');
      } else {
        console.log('📝 Creando nuevo VSD');
        await crearVSD({
          manufacturer: formData.manufacturer || '',
          model: formData.model || '',
          status: formData.status || 'online',
          health_score: parseInt(formData.health_score) || 100
        });
        showSnackbar('✅ VSD creado correctamente');
      }
      
      handleClose();
      loadData();
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      showSnackbar(error.message || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este VSD?')) {
      try {
        const { error } = await supabase.from('vfds').delete().eq('id', id);
        if (error) throw error;
        showSnackbar('✅ VSD eliminado');
        loadData();
      } catch (error) {
        showSnackbar('Error al eliminar', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'alarm': return 'warning';
      case 'maintenance': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'online': return '🟢 Online';
      case 'offline': return '🔴 Offline';
      case 'alarm': return '🟡 Alarma';
      case 'maintenance': return '🔧 Mantenimiento';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando VSDs...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="primary">⚡ Variadores de Velocidad (VSD)</Typography>
          <Typography variant="body2" color="textSecondary">Gestión de VSDs y su estado operativo</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ borderRadius: 3 }}>Nuevo VSD</Button>
          <IconButton onClick={loadData} sx={{ bgcolor: 'rgba(108,99,255,0.1)' }}><Refresh /></IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {vfds.map((vfd) => (
          <Grid item xs={12} sm={6} md={4} key={vfd.id}>
            <Card sx={{ borderRadius: 4, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' } }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="h6" fontWeight="700">{vfd.equipment_id_simple}</Typography>
                    <Typography variant="body2" color="textSecondary">{vfd.manufacturer || 'Sin fabricante'} {vfd.model || ''}</Typography>
                  </Box>
                  <Chip label={getStatusLabel(vfd.status)} color={getStatusColor(vfd.status)} size="small" />
                </Box>
                <Box mt={2}>
                  <Typography variant="caption" color="textSecondary">Health Score</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Speed sx={{ color: vfd.health_score > 80 ? 'success.main' : 'warning.main' }} />
                    <Typography variant="h5" fontWeight="700">{vfd.health_score}%</Typography>
                  </Box>
                </Box>
                <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                  <Button size="small" onClick={() => handleOpen(vfd)}><Edit fontSize="small" sx={{ mr: 0.5 }} /> Editar</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(vfd.id)}><Delete fontSize="small" sx={{ mr: 0.5 }} /> Eliminar</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle><Typography variant="h6" fontWeight="700">{editing ? '✏️ Editar VSD' : '➕ Nuevo VSD'}</Typography></DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="🔑 Código del VSD" value={formData.equipment_id_simple} disabled InputProps={{ readOnly: true, sx: { backgroundColor: '#f5f5f5' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Fabricante" value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Modelo" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} label="Estado">
                  <MenuItem value="online">🟢 Online</MenuItem>
                  <MenuItem value="offline">🔴 Offline</MenuItem>
                  <MenuItem value="alarm">🟡 Alarma</MenuItem>
                  <MenuItem value="maintenance">🔧 Mantenimiento</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Health Score (%)" type="number" value={formData.health_score} onChange={(e) => setFormData({ ...formData, health_score: parseInt(e.target.value) || 0 })} inputProps={{ min: 0, max: 100 }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? 'Actualizar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default VSDPage;
