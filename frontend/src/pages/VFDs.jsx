import React, { useEffect, useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Chip,
  Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, useTheme, LinearProgress,
  Snackbar, Alert, ImageList, ImageListItem,
  CircularProgress, useMediaQuery
} from '@mui/material';
import {
  Add, Edit, Delete, Refresh, Search, Close,
  Speed as SpeedIcon, Build as BuildIcon,
  CheckCircle as OnlineIcon, Error as OfflineIcon,
  Warning as WarningIcon, Image as ImageIcon,
  CameraAlt as CameraIcon
} from '@mui/icons-material';
import { vfds } from '../api/endpoints';
import { uploadImage, deleteImage } from '../services/imageUpload';

const VFDs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
      setVfdsList(res.data.data || []);
      setFilteredList(res.data.data || []);
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
      setFormData({
        equipment_id: vfd.equipment_id || '',
        manufacturer: vfd.manufacturer || '',
        model: vfd.model || '',
        serial_number: vfd.serial_number || '',
        power_rating: vfd.power_rating !== null && vfd.power_rating !== undefined ? vfd.power_rating : '',
        voltage_rating: vfd.voltage_rating !== null && vfd.voltage_rating !== undefined ? vfd.voltage_rating : '',
        kva: vfd.kva !== null && vfd.kva !== undefined ? vfd.kva : '',
        site: vfd.site || '',
        plant: vfd.plant || '',
        department: vfd.department || '',
        image_url1: vfd.image_url1 || '',
        image_url2: vfd.image_url2 || '',
        notes: vfd.notes || ''
      });
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
      // ✅ VALIDAR Y CONVERTIR CAMPOS NUMÉRICOS
      const dataToSend = {
        equipment_id: formData.equipment_id || null,
        manufacturer: formData.manufacturer || null,
        model: formData.model || null,
        serial_number: formData.serial_number || null,
        power_rating: formData.power_rating ? parseFloat(formData.power_rating) : null,
        voltage_rating: formData.voltage_rating ? parseInt(formData.voltage_rating) : null,
        kva: formData.kva ? parseFloat(formData.kva) : null,
        site: formData.site || null,
        plant: formData.plant || null,
        department: formData.department || null,
        image_url1: formData.image_url1 || null,
        image_url2: formData.image_url2 || null,
        notes: formData.notes || null
      };

      // ✅ ELIMINAR CAMPOS VACÍOS PARA EVITAR ERRORES
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '' || dataToSend[key] === null || dataToSend[key] === undefined) {
          delete dataToSend[key];
        }
      });

      if (editing) {
        await vfds.update(editing.id, dataToSend);
        showSnackbar('✅ VFD actualizado correctamente');
      } else {
        await vfds.create(dataToSend);
        showSnackbar('✅ VFD creado correctamente');
      }
      handleClose();
      loadVFDs();
    } catch (error) {
      console.error('Error al guardar:', error);
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

  // ... resto del código (getStatusColor, getStatusIcon, getHealthColor, VFDCard)
  // (mantener igual que antes)

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Cargando VFDs...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2} mb={4}>
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" className="gradient-text">
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
            sx={{ minWidth: isMobile ? 120 : 200, flex: isMobile ? 1 : 'none' }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{ borderRadius: 3, px: isMobile ? 2 : 3 }}
            size={isMobile ? "small" : "medium"}
          >
            {isMobile ? 'Nuevo' : 'Nuevo VFD'}
          </Button>
          <IconButton onClick={loadVFDs} sx={{ bgcolor: 'rgba(108,99,255,0.1)' }} size={isMobile ? "small" : "medium"}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Grid de VFDs */}
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
                onChange={(e) => setFormData({...formData, power_rating: e.target.value})}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Voltaje (V)"
                type="number"
                value={formData.voltage_rating}
                onChange={(e) => setFormData({...formData, voltage_rating: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="KVA"
                type="number"
                value={formData.kva}
                onChange={(e) => setFormData({...formData, kva: e.target.value})}
                inputProps={{ step: "0.1" }}
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
