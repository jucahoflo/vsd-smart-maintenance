import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button,
  TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Chip, Snackbar, Alert,
  CircularProgress, InputAdornment, CardMedia, Paper
} from '@mui/material';
import { Add, Refresh, Edit, Delete, Search, CloudUpload, DeleteForever } from '@mui/icons-material';
import { supabase } from '../config/supabase';

const Inventory = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    part_code: '',
    sap_code: '',
    name: '',
    description: '',
    manufacturer: '',
    model: '',
    stock_quantity: 0,
    location: '',
    compatible_vsds: '',
    image_url: ''
  });

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parts_inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParts(data || []);
    } catch (error) {
      console.error('❌ Error loading parts:', error);
      showSnackbar('Error al cargar el inventario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpen = (part = null) => {
    if (part) {
      setEditing(part);
      setFormData({
        part_code: part.part_code,
        sap_code: part.sap_code || '',
        name: part.name || '',
        description: part.description || '',
        manufacturer: part.manufacturer || '',
        model: part.model || '',
        stock_quantity: part.stock_quantity || 0,
        location: part.location || '',
        compatible_vsds: part.compatible_vsds || '',
        image_url: part.image_url || ''
      });
    } else {
      setEditing(null);
      setFormData({
        part_code: '',
        sap_code: '',
        name: '',
        description: '',
        manufacturer: '',
        model: '',
        stock_quantity: 0,
        location: '',
        compatible_vsds: '',
        image_url: ''
      });
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditing(null);
  };

  const uploadImage = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `part_${Date.now()}.${fileExt}`;
      const filePath = `parts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vsd_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('vsd_images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: urlData.publicUrl });
      showSnackbar('✅ Imagen subida correctamente', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      showSnackbar('❌ Error al subir la imagen', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image_url: '' });
  };

  const handleSave = async () => {
    try {
      if (!formData.part_code.trim()) {
        showSnackbar('El código de la parte es obligatorio', 'warning');
        return;
      }
      if (!formData.name.trim()) {
        showSnackbar('El nombre de la parte es obligatorio', 'warning');
        return;
      }

      const dataToSend = {
        part_code: formData.part_code.trim().toUpperCase(),
        sap_code: formData.sap_code || '',
        name: formData.name,
        description: formData.description || '',
        manufacturer: formData.manufacturer || '',
        model: formData.model || '',
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        location: formData.location || '',
        compatible_vsds: formData.compatible_vsds || '',
        image_url: formData.image_url || ''
      };

      if (editing) {
        const { error } = await supabase
          .from('parts_inventory')
          .update(dataToSend)
          .eq('id', editing.id);
        if (error) throw error;
        showSnackbar('✅ Parte actualizada correctamente', 'success');
      } else {
        const { data: existing } = await supabase
          .from('parts_inventory')
          .select('part_code')
          .eq('part_code', dataToSend.part_code)
          .maybeSingle();
        if (existing) {
          showSnackbar(`❌ El código ${dataToSend.part_code} ya existe`, 'error');
          return;
        }
        const { error } = await supabase
          .from('parts_inventory')
          .insert([dataToSend]);
        if (error) throw error;
        showSnackbar('✅ Parte creada correctamente', 'success');
      }
      
      handleClose();
      loadParts();
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      showSnackbar(error.message || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async (id, partCode) => {
    if (!window.confirm(`¿Estás seguro de eliminar la parte ${partCode}?`)) return;
    try {
      const { error } = await supabase
        .from('parts_inventory')
        .delete()
        .eq('id', id);
      if (error) throw error;
      showSnackbar('✅ Parte eliminada', 'success');
      loadParts();
    } catch (error) {
      showSnackbar('Error al eliminar', 'error');
    }
  };

  const filteredParts = parts.filter((part) =>
    part.part_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.compatible_vsds?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando inventario...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="primary">
            📦 Inventario de Partes
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gestión de repuestos, accesorios y partes para VSDs
          </Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar parte..."
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
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ borderRadius: 3 }}>Nueva Parte</Button>
          <IconButton onClick={loadParts} sx={{ bgcolor: 'rgba(108,99,255,0.1)' }}><Refresh /></IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredParts.map((part) => (
          <Grid item xs={12} sm={6} md={4} key={part.id}>
            <Card sx={{ borderRadius: 4, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' } }}>
              {part.image_url && (
                <CardMedia
                  component="img"
                  height="180"
                  image={part.image_url}
                  alt={part.part_code}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="h6" fontWeight="700">{part.part_code}</Typography>
                    <Typography variant="body2" color="textSecondary">{part.name}</Typography>
                    <Typography variant="body2" color="textSecondary" fontSize="0.75rem">
                      {part.manufacturer || ''} {part.model || ''}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`Stock: ${part.stock_quantity}`} 
                    color={part.stock_quantity > 0 ? 'success' : 'error'} 
                    size="small" 
                  />
                </Box>
                <Box mt={1}>
                  <Typography variant="caption" color="textSecondary">SAP: {part.sap_code || '-'}</Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Compatible con: {part.compatible_vsds || 'N/A'}
                  </Typography>
                </Box>
                <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                  <Button size="small" onClick={() => handleOpen(part)}><Edit fontSize="small" sx={{ mr: 0.5 }} /> Editar</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(part.id, part.part_code)}><Delete fontSize="small" sx={{ mr: 0.5 }} /> Eliminar</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredParts.length === 0 && !loading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">No hay partes registradas en el inventario</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>Haz clic en "Nueva Parte" para agregar el primer repuesto</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle><Typography variant="h6" fontWeight="700">{editing ? '✏️ Editar Parte' : '➕ Nueva Parte'}</Typography></DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="🔑 Código de Parte"
                value={formData.part_code}
                onChange={(e) => setFormData({ ...formData, part_code: e.target.value.toUpperCase() })}
                required
                disabled={!!editing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código SAP"
                value={formData.sap_code}
                onChange={(e) => setFormData({ ...formData, sap_code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="📛 Nombre de la Parte"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="📝 Descripción"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="🏭 Fabricante"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="📟 Modelo"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="📍 Ubicación en Bodega"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="📦 Stock / Cantidad"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="🔗 Compatible con VSDs"
                value={formData.compatible_vsds}
                onChange={(e) => setFormData({ ...formData, compatible_vsds: e.target.value })}
                helperText="Ej: V001, V002, V005 (Separa por comas)"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>🖼️ Imagen de la Parte</Typography>
              <Box sx={{ border: '1px dashed #ccc', borderRadius: 2, p: 2, textAlign: 'center' }}>
                {formData.image_url ? (
                  <Box>
                    <img src={formData.image_url} alt="Parte" style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }} />
                    <Button size="small" color="error" startIcon={<DeleteForever />} onClick={removeImage} sx={{ mt: 1 }}>Eliminar imagen</Button>
                  </Box>
                ) : (
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="part-image-upload"
                      type="file"
                      onChange={(e) => uploadImage(e.target.files[0])}
                    />
                    <label htmlFor="part-image-upload">
                      <IconButton color="primary" component="span" disabled={uploadingImage}>
                        <CloudUpload />
                      </IconButton>
                    </label>
                    <Typography variant="caption" display="block">Subir imagen</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={uploadingImage}>{editing ? 'Actualizar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Inventory;
