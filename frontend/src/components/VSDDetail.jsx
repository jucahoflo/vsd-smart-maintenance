import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Grid, Chip, Button, IconButton,
  Divider, Paper, ImageList, ImageListItem, Dialog as ImageDialog
} from '@mui/material';
import {
  Close as CloseIcon,
  Speed as SpeedIcon,
  LocationOn as LocationOnIcon,
  Image as ImageIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';

const VSDDetail = ({ open, vsd, onClose }) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!vsd) return null;

  // Obtener todas las imágenes
  const images = [
    vsd.image_url_1,
    vsd.image_url_2,
    vsd.image_url_3
  ].filter(Boolean);

  const getStatusColor = (status) => {
    const colors = {
      'activo': '#22c55e',
      'mantenimiento': '#eab308',
      'critico': '#ef4444',
      'inactivo': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'activo': '✅ Activo',
      'mantenimiento': '🔧 Mantenimiento',
      'critico': '🚨 Crítico',
      'inactivo': '⏸️ Inactivo'
    };
    return labels[status] || status || 'Desconocido';
  };

  const handleImageClick = (url) => {
    setSelectedImage(url);
    setImageDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">
              {vsd.codigo_vsd} - Detalles Completos
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {/* Estado */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Chip
              label={getStatusLabel(vsd.status)}
              sx={{ bgcolor: getStatusColor(vsd.status), color: '#fff', fontWeight: 'bold' }}
            />
            {vsd.health_score && (
              <Chip
                icon={<SpeedIcon />}
                label={`Health: ${vsd.health_score}%`}
                sx={{ bgcolor: '#2563eb', color: '#fff' }}
              />
            )}
          </Box>

          {/* Información principal */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Fabricante</Typography>
              <Typography variant="body1">{vsd.manufacturer || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Modelo</Typography>
              <Typography variant="body1">{vsd.model || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Número de Serie</Typography>
              <Typography variant="body1">{vsd.serial_number || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Fecha de Creación</Typography>
              <Typography variant="body1">
                {vsd.created_at ? new Date(vsd.created_at).toLocaleDateString('es-ES') : 'N/A'}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Datos técnicos */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>⚡ Datos Técnicos</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">Tensión (V)</Typography>
              <Typography variant="body1">{vsd.voltage_rating || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">KVA</Typography>
              <Typography variant="body1">{vsd.kva || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">Health Score</Typography>
              <Typography variant="body1">{vsd.health_score || 'N/A'}%</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Ubicación */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>📍 Ubicación</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">Sitio</Typography>
              <Typography variant="body1">{vsd.site || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">Planta</Typography>
              <Typography variant="body1">{vsd.plant || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">Departamento</Typography>
              <Typography variant="body1">{vsd.department || 'N/A'}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Observaciones */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>📝 Observaciones</Typography>
          <Paper sx={{ p: 2, bgcolor: '#f3f4f6', borderRadius: 1 }}>
            <Typography variant="body2">
              {vsd.observations || 'Sin observaciones'}
            </Typography>
          </Paper>

          <Divider sx={{ my: 2 }} />

          {/* Imágenes */}
          {images.length > 0 && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">📸 Imágenes</Typography>
                <Button
                  size="small"
                  startIcon={<FullscreenIcon />}
                  onClick={() => setImageDialogOpen(true)}
                >
                  Ver todas
                </Button>
              </Box>
              <ImageList sx={{ width: '100%', height: 200 }} cols={3} rowHeight={164}>
                {images.map((url, idx) => (
                  <ImageListItem key={idx} onClick={() => handleImageClick(url)} sx={{ cursor: 'pointer' }}>
                    <img
                      src={url}
                      alt={`Imagen ${idx + 1}`}
                      style={{ height: 164, objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de imagen en pantalla completa */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>Imagen - {vsd.codigo_vsd}</Typography>
            <IconButton onClick={() => setImageDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Imagen completa"
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            )}
          </Box>
          {/* Miniaturas navegables */}
          {images.length > 1 && (
            <Box display="flex" gap={1} justifyContent="center" mt={2}>
              {images.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Miniatura ${idx + 1}`}
                  onClick={() => setSelectedImage(url)}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: 'cover',
                    borderRadius: 4,
                    cursor: 'pointer',
                    border: selectedImage === url ? '3px solid #2563eb' : '1px solid #e5e7eb'
                  }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VSDDetail;
