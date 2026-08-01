import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button,
  TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Chip, Snackbar, Alert,
  CircularProgress, FormControl, InputLabel, Select, MenuItem,
  InputAdornment, Stack, Avatar, CardMedia
} from '@mui/material';
import { Add, Refresh, Edit, Delete, Speed, Search, CloudUpload, DeleteForever } from '@mui/icons-material';
import { supabase } from '../config/supabase';
import { useSync } from '../context/SyncContext';

const VFDs = () => {
  const { isOnline, offlineQueue, addToQueue, clearQueue } = useSync();
  
  const [vfds, setVfds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    codigo_vsd: '',
    manufacturer: '',
    model: '',
    status: 'online',
    health_score: 100,
    serial_number: '',
    voltage_rating: '',
    kva: '',
    site: '',
    plant: '',
    department: '',
    observations: ''
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vfdToDelete, setVfdToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const MASTER_PASSWORD = 'admin123';

  const loadData = async () => {
    try {
      setLoading(true);
      let data = [];
      
      if (isOnline) {
        const { data: supabaseData, error } = await supabase
          .from('vsd')
          .select('*')
          .order('codigo_vsd', { ascending: true });
        if (error) throw error;
        data = supabaseData || [];
        localStorage.setItem('vsd_cache', JSON.stringify(data));
      } else {
        const cached = localStorage.getItem('vsd_cache');
        if (cached) {
          data = JSON.parse(cached);
        }
      }

      setVfds(data);
    } catch (error) {
      console.error('❌ Error loading VSDs:', error);
      showSnackbar('Error al cargar VSDs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isOnline]);

  useEffect(() => {
    const syncOfflineChanges = async () => {
      if (isOnline && offlineQueue.length > 0) {
        console.log(`🔄 Procesando ${offlineQueue.length} acciones pendientes...`);
        let hasError = false;
        
        for (const action of offlineQueue) {
          try {
            if (action.type === 'INSERT') {
              await supabase.from(action.table).insert(action.data);
            } else if (action.type === 'UPDATE') {
              await supabase.from(action.table).update(action.data).eq('id', action.id);
            } else if (action.type === 'DELETE') {
              await supabase.from(action.table).delete().eq('id', action.id);
            }
          } catch (error) {
            console.error('❌ Error al sincronizar acción:', action, error);
            hasError = true;
          }
        }
        
        if (!hasError) {
          clearQueue();
          showSnackbar('✅ Cambios sincronizados correctamente con la nube!', 'success');
        } else {
          showSnackbar('⚠️ Algunos cambios no se pudieron sincronizar.', 'warning');
        }
      }
    };

    syncOfflineChanges();
  }, [isOnline, offlineQueue]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpen = (vfd = null) => {
    if (vfd) {
      setEditing(vfd);
      setFormData({
        codigo_vsd: vfd.codigo_vsd,
        manufacturer: vfd.manufacturer || '',
        model: vfd.model || '',
        status: vfd.status || 'online',
        health_score: vfd.health_score || 100,
        serial_number: vfd.serial_number || '',
        voltage_rating: vfd.voltage_rating || '',
        kva: vfd.kva || '',
        site: vfd.site || '',
        plant: vfd.plant || '',
        department: vfd.department || '',
        observations: vfd.observations || ''
      });
    } else {
      setEditing(null);
      setFormData({
        codigo_vsd: '',
        manufacturer: '',
        model: '',
        status: 'online',
        health_score: 100,
        serial_number: '',
        voltage_rating: '',
        kva: '',
        site: '',
        plant: '',
        department: '',
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
        const dataToSend = {
          manufacturer: formData.manufacturer || '',
          model: formData.model || '',
          status: formData.status || 'online',
          health_score: parseInt(formData.health_score) || 100,
          serial_number: formData.serial_number || '',
          voltage_rating: formData.voltage_rating || '',
          kva: formData.kva || '',
          site: formData.site || '',
          plant: formData.plant || '',
          department: formData.department || '',
          observations: formData.observations || ''
        };

        if (isOnline) {
          const { error } = await supabase
            .from('vsd')
            .update(dataToSend)
            .eq('id', editing.id);
          if (error) throw error;
        } else {
          addToQueue({
            type: 'UPDATE',
            table: 'vsd',
            id: editing.id,
            data: dataToSend
          });
          // Actualizar caché local inmediatamente
          const cached = JSON.parse(localStorage.getItem('vsd_cache') || '[]');
          const updated = cached.map(v => v.id === editing.id ? { ...v, ...dataToSend } : v);
          localStorage.setItem('vsd_cache', JSON.stringify(updated));
          setVfds(updated);
        }
        showSnackbar('✅ VSD actualizado correctamente');
      } else {
        let nextNumber = 1;
        const cached = JSON.parse(localStorage.getItem('vsd_cache') || '[]');
        
        if (isOnline) {
          const { count, error: countError } = await supabase
            .from('vsd')
            .select('*', { count: 'exact', head: true });
          if (countError) throw countError;
          nextNumber = (count || 0) + 1;
        } else {
          nextNumber = cached.length + 1;
        }

        const nuevoCodigo = `V${nextNumber.toString().padStart(3, '0')}`;

        const newData = {
          codigo_vsd: nuevoCodigo,
          manufacturer: formData.manufacturer || '',
          model: formData.model || '',
          status: formData.status || 'online',
          health_score: parseInt(formData.health_score) || 100,
          serial_number: formData.serial_number || '',
          voltage_rating: formData.voltage_rating || '',
          kva: formData.kva || '',
          site: formData.site || '',
          plant: formData.plant || '',
          department: formData.department || '',
          observations: formData.observations || ''
        };

        if (isOnline) {
          const { error } = await supabase
            .from('vsd')
            .insert(newData);
          if (error) throw error;
        } else {
          addToQueue({
            type: 'INSERT',
            table: 'vsd',
            data: newData
          });
          // Actualizar caché local
          const cached = JSON.parse(localStorage.getItem('vsd_cache') || '[]');
          cached.unshift(newData);
          localStorage.setItem('vsd_cache', JSON.stringify(cached));
          setVfds(cached);
        }
        showSnackbar('✅ VSD creado correctamente');
      }
      
      handleClose();
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      showSnackbar(error.message || 'Error al guardar', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setVfdToDelete(id);
    setDeletePassword('');
    setDeleteError('');
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletePassword !== MASTER_PASSWORD) {
      setDeleteError('❌ Contraseña incorrecta. Intenta de nuevo.');
      return;
    }

    try {
      if (isOnline) {
        const { error } = await supabase
          .from('vsd')
          .delete()
          .eq('id', vfdToDelete);
        if (error) throw error;
      } else {
        addToQueue({
          type: 'DELETE',
          table: 'vsd',
          id: vfdToDelete
        });
        const cached = JSON.parse(localStorage.getItem('vsd_cache') || '[]');
        const updated = cached.filter(v => v.id !== vfdToDelete);
        localStorage.setItem('vsd_cache', JSON.stringify(updated));
        setVfds(updated);
      }
      
      showSnackbar('✅ VSD eliminado permanentemente');
      setDeleteDialogOpen(false);
      setVfdToDelete(null);
    } catch (error) {
      showSnackbar('Error al eliminar', 'error');
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

  const filteredVfds = vfds.filter((vfd) => 
    vfd.codigo_vsd?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vfd.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vfd.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Box display="flex" gap={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar VSD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ borderRadius: 3 }}>Nuevo VSD</Button>
          <IconButton onClick={loadData} sx={{ bgcolor: 'rgba(108,99,255,0.1)' }}><Refresh /></IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredVfds.map((vfd) => (
          <Grid item xs={12} sm={6} md={4} key={vfd.id}>
            <Card sx={{ borderRadius: 4, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' } }}>
              {vfd.image_url_1 && (
                <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={vfd.image_url_1}
                    alt={`Imagen de ${vfd.codigo_vsd}`}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem' }}>
                    👁️ Ver
                  </Box>
                </Box>
              )}
              
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="h6" fontWeight="700">{vfd.codigo_vsd}</Typography>
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
                  <Button size="small" color="error" onClick={() => handleDeleteClick(vfd.id)}><Delete fontSize="small" sx={{ mr: 0.5 }} /> Eliminar</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredVfds.length === 0 && !loading && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                {searchTerm ? `No hay VSDs que coincidan con "${searchTerm}"` : 'No hay VSDs registrados'}
              </Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {searchTerm ? 'Intenta con otra búsqueda' : 'Haz clic en "Nuevo VSD" para crear el primero'}
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle><Typography variant="h6" fontWeight="700">{editing ? '✏️ Editar VSD' : '➕ Nuevo VSD'}</Typography></DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="🔑 Código del VSD" value={formData.codigo_vsd} disabled InputProps={{ readOnly: true, sx: { backgroundColor: '#f5f5f5' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Fabricante" value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Modelo" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Serial Number" value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Voltage Rating (V)" value={formData.voltage_rating} onChange={(e) => setFormData({ ...formData, voltage_rating: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="KVA" value={formData.kva} onChange={(e) => setFormData({ ...formData, kva: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Sitio / Site" value={formData.site} onChange={(e) => setFormData({ ...formData, site: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Planta / Plant" value={formData.plant} onChange={(e) => setFormData({ ...formData, plant: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Departamento" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="📝 Observaciones" value={formData.observations} onChange={(e) => setFormData({ ...formData, observations: e.target.value })} multiline rows={3} />
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

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle><Typography variant="h6" fontWeight="700" color="error">⚠️ Confirmar Eliminación</Typography></DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Esta acción es **permanente**. Para eliminar este VSD, ingresa la contraseña maestra.
          </Typography>
          <TextField
            fullWidth
            label="🔐 Contraseña de seguridad"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            error={!!deleteError}
            helperText={deleteError}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>Eliminar Permanentemente</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default VFDs;
