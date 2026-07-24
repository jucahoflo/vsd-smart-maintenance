import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon
} from '@mui/icons-material';
import { useVSD } from '../../context/VSDContext';
import { toast } from 'react-toastify';

const VSDImageUpload = ({ open, onClose, vsdId, onImageAdded, currentImages = [] }) => {
  const { addImageToVSD } = useVSD();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const maxImages = 4;

  const remainingSlots = maxImages - currentImages.length;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      toast.error('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
      
      if (images.length + currentImages.length >= maxImages) {
        toast.warning(`⚠️ Máximo ${maxImages} imágenes permitidas`);
        return;
      }
      
      setImages(prev => [...prev, {
        id: Date.now().toString(),
        url: imageDataUrl,
        nombre: `Foto_${new Date().toISOString().slice(0,10)}_${Date.now()}`
      }]);
      stopCamera();
      toast.success('📸 Foto capturada');
    }
  };

  const handleFileSelect = (event) => {
    const files = event.target.files;
    const remaining = maxImages - (currentImages.length + images.length);
    
    if (remaining <= 0) {
      toast.warning(`⚠️ Ya tienes ${maxImages} imágenes`);
      return;
    }

    const filesToProcess = Math.min(files.length, remaining);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        // eslint-disable-next-line no-loop-func
        reader.onload = (e) => {
          setImages(prev => [...prev, {
            id: Date.now().toString() + i,
            url: e.target.result,
            nombre: file.name
          }]);
        };
        reader.readAsDataURL(file);
      }
    }

    if (filesToProcess < files.length) {
      toast.info(`📸 Se cargaron ${filesToProcess} de ${files.length} archivos (límite: ${maxImages})`);
    }
    
    event.target.value = '';
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSave = async () => {
    if (images.length === 0) {
      toast.warning('No hay imágenes para guardar');
      return;
    }

    setLoading(true);
    try {
      let savedCount = 0;
      for (const image of images) {
        const result = await addImageToVSD(vsdId, {
          url: image.url,
          nombre: image.nombre
        });
        if (result) savedCount++;
      }
      
      if (savedCount > 0) {
        toast.success(`✅ ${savedCount} imagen${savedCount > 1 ? 'es' : ''} guardada${savedCount > 1 ? 's' : ''}`);
        if (onImageAdded) onImageAdded();
        setImages([]);
        onClose();
      }
    } catch (error) {
      console.error('Error al guardar imágenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setImages([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight="bold">
              📸 Subir Imágenes
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {currentImages.length} de {maxImages} imágenes • {remainingSlots} disponibles
            </Typography>
          </Box>
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Alert severity={remainingSlots > 0 ? "info" : "success"} sx={{ mb: 2 }}>
            {remainingSlots > 0 
              ? `📷 Puedes subir hasta ${remainingSlots} imagen${remainingSlots > 1 ? 'es' : ''} más`
              : '✅ Ya tienes el máximo de 4 imágenes'}
          </Alert>

          {currentImages.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Imágenes actuales ({currentImages.length}/4)
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {currentImages.map((img) => (
                  <Box key={img.id} sx={{ position: 'relative' }}>
                    <img
                      src={img.url}
                      alt={img.nombre}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '2px solid #22c55e'
                      }}
                    />
                    <Chip
                      label="✓"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: '#22c55e',
                        color: 'white',
                        fontSize: 12,
                        width: 24,
                        height: 24
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {images.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Nuevas imágenes ({images.length})
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {images.map((img) => (
                  <Box key={img.id} sx={{ position: 'relative' }}>
                    <img
                      src={img.url}
                      alt={img.nombre}
                      style={{
                        width: 80,
                        height: 80,
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
                        '&:hover': { bgcolor: '#f3f4f6' }
                      }}
                      onClick={() => removeImage(img.id)}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {cameraActive && (
            <Box sx={{ mb: 2 }}>
              <Paper sx={{ p: 2, bgcolor: '#000', borderRadius: 2 }}>
                <video
                  ref={videoRef}
                  style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }}
                  autoPlay
                  playsInline
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button variant="contained" color="primary" onClick={capturePhoto}>
                    📸 Capturar
                  </Button>
                  <Button variant="outlined" color="error" onClick={stopCamera}>
                    Cancelar
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}

          {!cameraActive && remainingSlots > 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  sx={{ py: 2, borderRadius: 2 }}
                >
                  📁 Subir desde archivo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  startIcon={<PhotoCameraIcon />}
                  sx={{ py: 2, borderRadius: 2 }}
                  onClick={startCamera}
                >
                  📷 Tomar foto
                </Button>
              </Grid>
            </Grid>
          )}

          {remainingSlots <= 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              ✅ Has alcanzado el máximo de {maxImages} imágenes
            </Alert>
          )}

          {(images.length > 0 || currentImages.length > 0) && (
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="body2" color="textSecondary">
                📊 Resumen: {currentImages.length + images.length} de {maxImages} imágenes
                {images.length > 0 && ` (${images.length} nuevas)`}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={images.length === 0 || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <AddPhotoAlternateIcon />}
        >
          {loading ? 'Guardando...' : `Guardar ${images.length} imagen${images.length > 1 ? 'es' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VSDImageUpload;