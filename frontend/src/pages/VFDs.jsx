import React, { useState, useEffect, useRef } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Chip,
  Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, useTheme, LinearProgress,
  Snackbar, Alert, ImageList, ImageListItem,
  CircularProgress
} from '@mui/material';
import {
  Add, Edit, Delete, Refresh, Search, Close,
  Speed as SpeedIcon, Build as BuildIcon,
  CheckCircle as OnlineIcon, Error as OfflineIcon,
  Warning as WarningIcon, Image as ImageIcon,
  CameraAlt as CameraIcon
} from '@mui/icons-material';
import { vfds, upload } from '../api/endpoints';
import { uploadImage, deleteImage } from '../services/imageUpload';

const VFDs = () => {
  const theme = useTheme();
  const [vfdsList, setVfdsList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    equipment_id: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    power_rating: '',
    voltage_rating: '',
    kva: '',
    site: '',
    plant: '',
    department: '',
    image_url1: '',
    image_url2: '',
    notes: ''
  });

  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  useEffect(() => {
    loadVFDs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredList(vfdsList.filter(v => 
        v.equipment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredList(vfdsList);
    }
  }, [searchTerm, vfdsList]);

  const loadVFDs = async () => {
    try {
      setLoading(true);
      const res = await vfds.getAll();
      const data = res.data.data || [];
      setVfdsList(data);
      setFilteredList(data);
    } catch (error) {
      console.error('Error loading VFDs:', error);
      showSnackbar('Error al cargar VFDs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleImageUpload = async (file, index) => {
    if (!file) return;

    try {
      setUploading(true);
      const vfdId = editing?.id;
      if (!vfdId) {
        showSnackbar('Primero guarda el VFD antes de subir imágenes', 'warning');
        return;
      }
      
      const url = await uploadImage(file, vfdId, index);
      
      if (url) {
        if (index === 1) {
          setFormData({...formData, image_url1: url});
        } else {
          setFormData({...formData, image_url2: url});
        }
        showSnackbar('✅ Imagen subida correctamente');
        loadVFDs();
      }
    } catch (error) {
      showSnackbar(error.message || 'Error al subir imagen', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(file, index);
    }
    event.target.value = '';
  };

  const handleRemoveImage = async (index) => {
    try {
      const vfdId = editing?.id;
      if (!vfdId) return;
      
      await deleteImage(vfdId, index);
      
      if (index === 1) {
        setFormData({...formData, image_url1: ''});
      } else {
        setFormData({...formData, image_url2: ''});
      }
      showSnackbar('✅ Imagen eliminada');
      loadVFDs();
    } catch (error) {
      showSnackbar('Error al eliminar imagen', 'error');
    }
  };

  const handleOpen = (vfd = null) => {
    if (vfd) {
      setEditing(vfd);
      setFormData(vfd);
    } else {
      setEditing(null);
      setFormData({
        equipment_id: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        power_rating: '',
        voltage_rating: '',
        kva: '',
        site: '',
        plant: '',
        department: '',
        image_url1: '',
        image_url2: '',
        notes: ''
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
        await vfds.update(editing.id, formData);
        showSnackbar('✅ VFD actualizado correctamente');
      } else {
        const res = await vfds.create(formData);
        showSnackbar('✅ VFD creado correctamente');
      }
      handleClose();
      loadVFDs();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este VFD?')) {
      try {
        await vfds.delete(id);
        showSnackbar('✅ VFD eliminado correctamente');
        loadVFDs();
      } catch (error) {
        showSnackbar('Error al eliminar', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return theme.palette.success.main;
      case 'offline': return theme.palette.error.main;
      case 'alarm': return theme.palette.warning.main;
      case 'maintenance': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <OnlineIcon sx={{ color: '#00B894', fontSize: 20 }} />;
      case 'offline': return <OfflineIcon sx={{ color: '#FF6B6B', fontSize: 20 }} />;
      case 'alarm': return <WarningIcon sx={{ color: '#FDCB6E', fontSize: 20 }} />;
      case 'maintenance': return <BuildIcon sx={{ color: '#74B9FF', fontSize: 20 }} />;
      default: return <SpeedIcon />;
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const VFDCard = ({ vfd }) => {
    const images = [vfd.image_url1, vfd.image_url2].filter(Boolean);

    return (
      <Card sx={{ 
        borderRadius: 4,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 16px 32px rgba(0,0,0,0.12)'
        }
      }}>
        {images.length > 0 ? (
          <Box sx={{ position: 'relative', height: 180, overflow: 'hidden' }}>
            <ImageList cols={images.length} sx={{ height: 180, m: 0 }}>
              {images.map((img, idx) => (
                <ImageListItem key={idx} sx={{ overflow: 'hidden' }}>
                  <img
                    src={img}
                    alt={`${vfd.equipment_id} - ${idx + 1}`}
                    style={{ 
                      width: '100%', 
                      height: 180, 
                      objectFit: 'cover'
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.6)',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.7rem'
              }}
            >
              {images.length} 📷
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            height: 120, 
            bgcolor: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <ImageIcon sx={{ fontSize: 40, color: '#ccc' }} />
          </Box>
        )}

        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start">
            <Box>
              <Typography variant="h6" fontWeight="700">
                {vfd.equipment_id}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {vfd.manufacturer} • {vfd.model}
              </Typography>
            </Box>
            <Chip
              icon={getStatusIcon(vfd.status)}
              label={vfd.status}
              size="small"
              sx={{
                bgcolor: `${getStatusColor(vfd.status)}20`,
                color: getStatusColor(vfd.status),
                fontWeight: 600
              }}
            />
          </Box>

          <Box mt={2}>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography variant="caption" color="textSecondary">Potencia</Typography>
                <Typography fontWeight="600">{vfd.power_rating || '--'} kW</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="textSecondary">Voltaje</Typography>
                <Typography fontWeight="600">{vfd.voltage_rating || '--'} V</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="textSecondary">KVA</Typography>
                <Typography fontWeight="600">{vfd.kva || '--'}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Box mt={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="textSecondary">Health Score</Typography>
              <Typography fontWeight="700" sx={{ color: getHealthColor(vfd.health_score || 100) }}>
                {vfd.health_score || 100}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={vfd.health_score || 100}
              sx={{
                height: 6,
                borderRadius: 3,
                mt: 0.5,
                bgcolor: `${getHealthColor(vfd.health_score || 100)}25`,
                '& .MuiLinearProgress-bar': {
                  bgcolor: getHealthColor(vfd.health_score || 100),
                  borderRadius: 3
                }
              }}
            />
          </Box>

          {vfd.site && (
            <Typography variant="caption" color="textSecondary" display="block" mt={1}>
              📍 {vfd.site} • {vfd.department || ''}
            </Typography>
          )}

          {vfd.notes && (
            <Typography variant="caption" color="textSecondary" display="block" mt={0.5} sx={{ fontStyle: 'italic' }}>
              📝 {vfd.notes}
            </Typography>
          )}

          <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
            <IconButton size="small" onClick={() => handleOpen(vfd)} sx={{ color: theme.palette.primary.main }}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => handleDelete(vfd.id)} sx={{ color: theme.palette.error.main }}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Cargando VFDs...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2} mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="800" className="gradient-text">
            ⚡ VFDs
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gestión de variadores de velocidad
          </Typography>
        </Box>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Buscar VFD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{ borderRadius: 3, px: 3 }}
          >
            Nuevo VFD
          </Button>
          <IconButton onClick={loadVFDs} sx={{ bgcolor: 'rgba(108,99,255,0.1)' }}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredList.map((vfd, index) => (
          <Grid item xs={12} sm={6} lg={4} key={vfd.id} className={`fade-in fade-in-delay-${(index % 4) + 1}`}>
            <VFDCard vfd={vfd} />
          </Grid>
        ))}
        {filteredList.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                {searchTerm ? 'No se encontraron VFDs' : 'No hay VFDs registrados'}
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="700">
            {editing ? '✏️ Editar VFD' : '➕ Nuevo VFD'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Equipment ID"
                value={formData.equipment_id}
                onChange={(e) => setFormData({...formData, equipment_id: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fabricante"
                value={formData.manufacturer}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Modelo"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Serial Number"
                value={formData.serial_number}
                onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Potencia (kW)"
                type="number"
                value={formData.power_rating}
                onChange={(e) => setFormData({...formData, power_rating: parseFloat(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Voltaje (V)"
                type="number"
                value={formData.voltage_rating}
                onChange={(e) => setFormData({...formData, voltage_rating: parseInt(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="KVA"
                type="number"
                value={formData.kva}
                onChange={(e) => setFormData({...formData, kva: parseFloat(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Sitio"
                value={formData.site}
                onChange={(e) => setFormData({...formData, site: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Planta"
                value={formData.plant}
                onChange={(e) => setFormData({...formData, plant: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Departamento"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </Grid>
            
            {/* Imágenes */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" sx={{ mt: 1, mb: 1 }}>
                📷 Imágenes (máximo 2)
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ border: '1px dashed #ccc', borderRadius: 2, p: 2, textAlign: 'center' }}>
                {formData.image_url1 ? (
                  <Box sx={{ position: 'relative' }}>
                    <img 
                      src={formData.image_url1} 
                      alt="Imagen 1" 
                      style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 8 }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }}
                      onClick={() => handleRemoveImage(1)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<CameraIcon />}
                      onClick={() => fileInputRef1.current?.click()}
                      disabled={uploading || !editing}
                      sx={{ mb: 1 }}
                    >
                      {uploading ? <CircularProgress size={24} /> : 'Tomar foto o subir'}
                    </Button>
                    {!editing && (
                      <Typography variant="caption" display="block" color="warning.main">
                        ⚠️ Guarda el VFD primero
                      </Typography>
                    )}
                    <Typography variant="caption" display="block" color="textSecondary">
                      JPG, PNG, WEBP • Max 5MB
                    </Typography>
                    <input
                      ref={fileInputRef1}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileSelect(e, 1)}
                    />
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ border: '1px dashed #ccc', borderRadius: 2, p: 2, textAlign: 'center' }}>
                {formData.image_url2 ? (
                  <Box sx={{ position: 'relative' }}>
                    <img 
                      src={formData.image_url2} 
                      alt="Imagen 2" 
                      style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 8 }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }}
                      onClick={() => handleRemoveImage(2)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<CameraIcon />}
                      onClick={() => fileInputRef2.current?.click()}
                      disabled={uploading || !editing}
                      sx={{ mb: 1 }}
                    >
                      {uploading ? <CircularProgress size={24} /> : 'Tomar foto o subir'}
                    </Button>
                    {!editing && (
                      <Typography variant="caption" display="block" color="warning.main">
                        ⚠️ Guarda el VFD primero
                      </Typography>
                    )}
                    <Typography variant="caption" display="block" color="textSecondary">
                      JPG, PNG, WEBP • Max 5MB
                    </Typography>
                    <input
                      ref={fileInputRef2}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileSelect(e, 2)}
                    />
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas / Observaciones"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Información adicional sobre el VFD..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2 }}>
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

export default VFDs;
