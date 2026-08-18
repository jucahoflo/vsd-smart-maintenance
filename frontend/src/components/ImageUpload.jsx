import React, { useState, useRef } from 'react';
import {
  Box, Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, Typography, Paper
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Webcam from 'react-webcam';

const ImageUpload = ({ onImageUpload, onImageRemove, existingImages = [] }) => {
  const [openCamera, setOpenCamera] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);

  // Subir desde archivo
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('El archivo debe ser una imagen');
        return;
      }
      setSelectedImage(file);
      setOpenPreview(true);
      setError('');
    }
  };

  // Tomar foto con cámara
  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setSelectedImage(file);
          setOpenPreview(true);
          setOpenCamera(false);
        });
    }
  };

  // Confirmar imagen
  const handleConfirmImage = () => {
    if (selectedImage) {
      onImageUpload(selectedImage);
      setSelectedImage(null);
      setOpenPreview(false);
      setError('');
    }
  };

  // Cancelar
  const handleCancel = () => {
    setSelectedImage(null);
    setOpenPreview(false);
    setOpenCamera(false);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      {/* Botones para subir imagen */}
      <Box display="flex" gap={2} flexWrap="wrap">
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          sx={{ borderColor: '#2563eb', color: '#2563eb' }}
        >
          Subir imagen
        </Button>
        <Button
          variant="outlined"
          startIcon={<PhotoCameraIcon />}
          onClick={() => setOpenCamera(true)}
          sx={{ borderColor: '#22c55e', color: '#22c55e' }}
        >
          Tomar foto
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </Box>

      {/* Miniaturas de imágenes existentes */}
      {existingImages.length > 0 && (
        <Box display="flex" gap={1} mt={2} flexWrap="wrap">
          {existingImages.map((img, index) => (
            <Box key={index} position="relative">
              <img
                src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                alt={`Imagen ${index + 1}`}
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
                  bgcolor: '#ef4444',
                  color: '#fff',
                  '&:hover': { bgcolor: '#dc2626' },
                  width: 20,
                  height: 20
                }}
                onClick={() => onImageRemove(index)}
              >
                <DeleteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {/* Diálogo de la cámara */}
      <Dialog open={openCamera} onClose={() => setOpenCamera(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>Tomar foto</Typography>
            <IconButton onClick={() => setOpenCamera(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 400,
              height: 300,
              facingMode: "environment"
            }}
            style={{ width: '100%', borderRadius: 8 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCamera(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCapture} sx={{ bgcolor: '#22c55e' }}>
            Capturar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de previsualización */}
      <Dialog open={openPreview} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>Previsualizar imagen</Typography>
            <IconButton onClick={handleCancel}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          {selectedImage && (
            <Box>
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Previsualización"
                style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8 }}
              />
              <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                {selectedImage.name} - {(selectedImage.size / 1024).toFixed(0)} KB
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleConfirmImage}
            disabled={!selectedImage || loading}
            sx={{ bgcolor: '#2563eb' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Aceptar imagen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUpload;
