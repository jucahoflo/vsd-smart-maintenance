import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Alert,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Inventory as InventoryIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useVSD } from '../context/VSDContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const InventoryPage = () => {
  const { parts, vsds, createPart, updatePart, deletePart, loadAllData, loading } = useVSD();
  const [openForm, setOpenForm] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [openAssociateDialog, setOpenAssociateDialog] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedVsdId, setSelectedVsdId] = useState('');
  const [editingPart, setEditingPart] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    categoria: 'electrónica',
    cantidad: 0,
    ubicacion: '',
    proveedor: '',
    precio: 0,
    vsdId: '',
    imagen: null
  });

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ============ ASOCIAR PARTE A VSD ============
  const handleOpenAssociate = (part) => {
    setSelectedPart(part);
    setSelectedVsdId(part.vsdId || '');
    setOpenAssociateDialog(true);
  };

  const handleAssociate = async () => {
    if (!selectedPart || !selectedVsdId) {
      toast.warning('Selecciona un VSD');
      return;
    }

    try {
      const updatedPart = { ...selectedPart, vsdId: selectedVsdId };
      await updatePart(selectedPart._id, updatedPart);
      const vsd = vsds.find(v => v._id === selectedVsdId);
      toast.success(`✅ Parte asociada a ${vsd?.nombre || 'VSD'}`);
      setOpenAssociateDialog(false);
      setSelectedPart(null);
      setSelectedVsdId('');
      await loadAllData();
    } catch (error) {
      toast.error('Error al asociar la parte');
    }
  };

  const handleDesasociar = async () => {
    if (!selectedPart) return;

    try {
      const updatedPart = { ...selectedPart, vsdId: '' };
      await updatePart(selectedPart._id, updatedPart);
      toast.success('✅ Parte desasociada del VSD');
      setOpenAssociateDialog(false);
      setSelectedPart(null);
      setSelectedVsdId('');
      await loadAllData();
    } catch (error) {
      toast.error('Error al desasociar la parte');
    }
  };

  // ============ IMÁGENES ============
  const handleOpenImage = (part) => {
    setSelectedPart(part);
    setImagePreview(part.imagen || null);
    setOpenImageDialog(true);
  };

  const handleCloseImage = () => {
    setOpenImageDialog(false);
    setSelectedPart(null);
    setImagePreview(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedPart || !imagePreview) return;
    
    try {
      const updatedPart = { ...selectedPart, imagen: imagePreview };
      await updatePart(selectedPart._id, updatedPart);
      toast.success('✅ Imagen guardada correctamente');
      setOpenImageDialog(false);
      setSelectedPart(null);
      setImagePreview(null);
      await loadAllData();
    } catch (error) {
      toast.error('Error al guardar la imagen');
    }
  };

  const handleRemoveImage = async () => {
    if (!selectedPart) return;
    
    try {
      const updatedPart = { ...selectedPart, imagen: null };
      await updatePart(selectedPart._id, updatedPart);
      toast.success('✅ Imagen eliminada');
      setImagePreview(null);
      await loadAllData();
    } catch (error) {
      toast.error('Error al eliminar la imagen');
    }
  };

  // ============ CRUD PARTES ============
  const handleAddNew = () => {
    setEditingPart(null);
    setFormData({
      nombre: '',
      codigo: '',
      descripcion: '',
      categoria: 'electrónica',
      cantidad: 0,
      ubicacion: '',
      proveedor: '',
      precio: 0,
      vsdId: '',
      imagen: null
    });
    setOpenForm(true);
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setFormData({
      nombre: part.nombre || '',
      codigo: part.codigo || '',
      descripcion: part.descripcion || '',
      categoria: part.categoria || 'electrónica',
      cantidad: part.cantidad || 0,
      ubicacion: part.ubicacion || '',
      proveedor: part.proveedor || '',
      precio: part.precio || 0,
      vsdId: part.vsdId || '',
      imagen: part.imagen || null
    });
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta parte?')) {
      await deletePart(id);
      toast.success('✅ Parte eliminada');
      await loadAllData();
    }
  };

  const handleSave = async () => {
    if (!formData.nombre.trim() || !formData.codigo.trim()) {
      toast.error('Nombre y código son requeridos');
      return;
    }

    try {
      const dataToSave = { ...formData };
      
      if (editingPart) {
        await updatePart(editingPart._id, dataToSave);
        toast.success('✅ Parte actualizada');
      } else {
        await createPart(dataToSave);
        toast.success('✅ Parte creada');
      }
      setOpenForm(false);
      await loadAllData();
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleFormImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, imagen: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const categorias = [
    'electrónica', 'mecánica', 'refrigeración', 'cables', 'otros'
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" fontWeight="bold">
          Inventario ({parts.length})
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddNew}>
          Nueva Parte
        </Button>
      </Box>

      {/* LISTA DE PARTES */}
      {parts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <InventoryIcon sx={{ fontSize: 60, color: '#6b7280', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No hay partes en inventario
            </Typography>
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleAddNew}>
              Agregar primera parte
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {parts.map((part) => {
            const vsd = vsds.find(v => v._id === part.vsdId);
            return (
              <Grid item xs={12} sm={6} md={4} key={part._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="card-hover" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box 
                            sx={{ 
                              width: 50, 
                              height: 50, 
                              borderRadius: 2, 
                              bgcolor: part.imagen ? 'transparent' : '#f3f4f6',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              border: '1px solid #e5e7eb'
                            }}
                            onClick={() => handleOpenImage(part)}
                          >
                            {part.imagen ? (
                              <img 
                                src={part.imagen} 
                                alt={part.nombre} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <ImageIcon sx={{ color: '#9ca3af', fontSize: 24 }} />
                            )}
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {part.nombre}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Código: {part.codigo}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <IconButton size="small" onClick={() => handleEdit(part)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(part._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Chip 
                        label={part.categoria} 
                        size="small" 
                        sx={{ mt: 1, bgcolor: '#f3f4f6' }}
                      />
                      
                      <Box mt={2}>
                        <Typography variant="body2">
                          Cantidad: <strong>{part.cantidad}</strong>
                        </Typography>
                        <Typography variant="body2">
                          Precio: <strong>${part.precio}</strong>
                        </Typography>
                        {part.ubicacion && (
                          <Typography variant="body2">
                            Ubicación: {part.ubicacion}
                          </Typography>
                        )}
                      </Box>

                      {/* VSD ASOCIADO */}
                      <Box mt={1}>
                        {vsd ? (
                          <Chip
                            icon={<SpeedIcon fontSize="small" />}
                            label={`VSD: ${vsd.nombre}`}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        ) : (
                          <Chip
                            icon={<LinkIcon fontSize="small" />}
                            label="Sin VSD asociado"
                            variant="outlined"
                            size="small"
                            sx={{ color: '#6b7280' }}
                          />
                        )}
                      </Box>

                      {/* BOTONES DE ACCIÓN */}
                      <Box display="flex" justifyContent="flex-start" gap={1} mt={2} flexWrap="wrap">
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="primary"
                          startIcon={<LinkIcon fontSize="small" />}
                          onClick={() => handleOpenAssociate(part)}
                        >
                          {vsd ? 'Cambiar VSD' : 'Asociar a VSD'}
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          startIcon={<ImageIcon fontSize="small" />}
                          onClick={() => handleOpenImage(part)}
                        >
                          {part.imagen ? 'Ver imagen' : 'Agregar imagen'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ====== DIÁLOGO DE ASOCIACIÓN A VSD ====== */}
      <Dialog open={openAssociateDialog} onClose={() => setOpenAssociateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              🔗 Asociar Parte a VSD
            </Typography>
            <IconButton onClick={() => setOpenAssociateDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Selecciona el VSD al que quieres asociar esta parte:
            </Typography>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2 }}>
              {selectedPart?.nombre} - {selectedPart?.codigo}
            </Typography>

            {vsds.length === 0 ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                No hay VSDs registrados. Crea un VSD primero.
              </Alert>
            ) : (
              <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                <List>
                  {vsds.map((vsd) => {
                    const isSelected = selectedVsdId === vsd._id;
                    const isAssociated = vsd._id === selectedPart?.vsdId;
                    return (
                      <ListItemButton
                        key={vsd._id}
                        selected={isSelected}
                        onClick={() => setSelectedVsdId(vsd._id)}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          border: isAssociated && isSelected ? '2px solid #22c55e' : 'none',
                          bgcolor: isSelected ? 'primary.50' : 'transparent',
                          '&:hover': { bgcolor: '#f3f4f6' }
                        }}
                      >
                        <ListItemIcon>
                          <SpeedIcon color={isSelected ? 'primary' : 'action'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={vsd.nombre}
                          secondary={`${vsd.marca} ${vsd.modelo} • ${vsd.ubicacion}`}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                        {isAssociated && isSelected && (
                          <Chip
                            label="Actual"
                            size="small"
                            color="success"
                            icon={<CheckCircleIcon fontSize="small" />}
                          />
                        )}
                      </ListItemButton>
                    );
                  })}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={() => setOpenAssociateDialog(false)} variant="outlined">
            Cancelar
          </Button>
          {selectedPart?.vsdId && (
            <Button 
              onClick={handleDesasociar} 
              color="error" 
              variant="outlined"
            >
              Desasociar
            </Button>
          )}
          <Button 
            onClick={handleAssociate} 
            variant="contained" 
            color="primary"
            disabled={!selectedVsdId || selectedVsdId === selectedPart?.vsdId}
            startIcon={<LinkIcon />}
          >
            Asociar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ====== DIÁLOGO DE IMAGEN ====== */}
      <Dialog open={openImageDialog} onClose={handleCloseImage} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedPart?.nombre} - Imagen
            </Typography>
            <IconButton onClick={handleCloseImage}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ minHeight: 300 }}>
            {imagePreview ? (
              <Box>
                <img 
                  src={imagePreview} 
                  alt={selectedPart?.nombre} 
                  style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button variant="outlined" color="error" onClick={handleRemoveImage}>
                    Eliminar imagen
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ImageIcon sx={{ fontSize: 80, color: '#d1d5db' }} />
                <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                  No hay imagen para esta parte
                </Typography>
              </Box>
            )}

            {!imagePreview && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                  Subir desde archivo
                  <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                </Button>
              </Box>
            )}
            {imagePreview && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="contained" color="success" onClick={handleSaveImage}>
                  Guardar imagen
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* ====== FORMULARIO COMPLETO CON IMAGEN Y VSD ====== */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              {editingPart ? '✏️ Editar Parte' : '➕ Nueva Parte'}
            </Typography>
            <IconButton onClick={() => setOpenForm(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Nombre */}
            <TextField
              label="Nombre *"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              fullWidth
              required
            />
            
            {/* Código */}
            <TextField
              label="Código *"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              fullWidth
              required
            />
            
            {/* Descripción */}
            <TextField
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            
            {/* Categoría */}
            <TextField
              select
              label="Categoría"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              fullWidth
              SelectProps={{ native: true }}
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </TextField>
            
            {/* Cantidad y Precio */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Cantidad"
                  type="number"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Precio ($)"
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                  fullWidth
                />
              </Grid>
            </Grid>
            
            {/* Ubicación */}
            <TextField
              label="Ubicación"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              fullWidth
            />
            
            {/* Proveedor */}
            <TextField
              label="Proveedor"
              value={formData.proveedor}
              onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
              fullWidth
            />
            
            {/* ====== ASOCIAR A VSD ====== */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                🔗 Asociar a VSD
              </Typography>
              <TextField
                select
                label="Seleccionar VSD"
                value={formData.vsdId}
                onChange={(e) => setFormData({ ...formData, vsdId: e.target.value })}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="">Ninguno</option>
                {vsds.map((vsd) => (
                  <option key={vsd._id} value={vsd._id}>
                    {vsd.nombre} - {vsd.marca} {vsd.modelo}
                  </option>
                ))}
              </TextField>
              {formData.vsdId && (
                <Chip 
                  icon={<SpeedIcon fontSize="small" />}
                  label={`Asociado a ${vsds.find(v => v._id === formData.vsdId)?.nombre || 'VSD'}`}
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>

            {/* ====== IMAGEN ====== */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                🖼️ Imagen de la parte
              </Typography>
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ py: 1 }}
                >
                  Subir imagen
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFormImageUpload}
                  />
                </Button>
                {formData.imagen && (
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={formData.imagen} 
                      alt="Vista previa" 
                      style={{ 
                        width: 60, 
                        height: 60, 
                        objectFit: 'cover', 
                        borderRadius: 8,
                        border: '2px solid #e5e7eb'
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'white',
                        '&:hover': { bgcolor: '#fee2e2' }
                      }}
                      onClick={() => setFormData({ ...formData, imagen: null })}
                    >
                      <CloseIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                )}
              </Box>
              {!formData.imagen && (
                <Typography variant="caption" color="textSecondary">
                  No hay imagen seleccionada
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenForm(false)} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
          >
            {editingPart ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryPage;