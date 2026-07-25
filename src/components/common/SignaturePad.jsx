import React, { useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Chip
} from '@mui/material';
import {
  Clear as ClearIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const SignaturePad = ({ onSave, onClear, value, disabled }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen (PNG, JPG, JPEG)');
        return;
      }
      
      // Validar tamaño máximo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (onSave) {
          onSave(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    event.target.value = '';
  };

  const clear = () => {
    if (onClear) onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 2,
          bgcolor: '#f8fafc',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          minHeight: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        {value ? (
          // Mostrar la imagen de la firma
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <img
              src={value}
              alt="Firma digital"
              style={{
                maxWidth: '100%',
                maxHeight: 120,
                objectFit: 'contain',
                borderRadius: 8
              }}
            />
            <Chip
              label="✅ Firma cargada"
              size="small"
              color="success"
              sx={{ mt: 1 }}
            />
          </Box>
        ) : (
          // Mostrar mensaje para subir firma
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <ImageIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              No hay firma cargada
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Haz clic en "Subir firma" para seleccionar una imagen
            </Typography>
          </Box>
        )}
      </Paper>

      <Box display="flex" gap={1} mt={2} flexWrap="wrap">
        {!disabled && (
          <>
            <Button
              size="small"
              variant="contained"
              color="primary"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Subir firma
              <input
                type="file"
                hidden
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
            </Button>
            {value && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={clear}
              >
                Eliminar firma
              </Button>
            )}
          </>
        )}
        {value && !disabled && (
          <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            ✅ Firma cargada correctamente
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SignaturePad;