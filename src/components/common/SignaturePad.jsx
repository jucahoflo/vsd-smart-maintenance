import React, { useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton
} from '@mui/material';
import {
  Clear as ClearIcon,
  Save as SaveIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = ({ onSave, onClear, value, disabled }) => {
  const sigCanvas = useRef(null);

  const clear = () => {
    sigCanvas.current.clear();
    if (onClear) onClear();
  };

  const save = () => {
    if (sigCanvas.current) {
      const dataUrl = sigCanvas.current.toDataURL('image/png');
      if (onSave) onSave(dataUrl);
    }
  };

  const handleEnd = () => {
    // Auto-guardar al terminar de dibujar
    if (!disabled) {
      save();
    }
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 1,
          bgcolor: '#f8fafc',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          position: 'relative'
        }}
      >
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width: 400,
            height: 150,
            className: 'signature-canvas',
            style: {
              width: '100%',
              height: '100%',
              minHeight: 120,
              borderRadius: 8,
              backgroundColor: '#ffffff',
              cursor: disabled ? 'default' : 'crosshair'
            }
          }}
          onEnd={handleEnd}
          disabled={disabled}
        />
        {value && !disabled && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(34, 197, 94, 0.1)',
              px: 1,
              py: 0.5,
              borderRadius: 1
            }}
          >
            <Typography variant="caption" color="success.main">
              ✅ Firma guardada
            </Typography>
          </Box>
        )}
      </Paper>
      <Box display="flex" gap={1} mt={1}>
        {!disabled && (
          <>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<ClearIcon />}
              onClick={clear}
            >
              Limpiar
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={save}
            >
              Guardar Firma
            </Button>
          </>
        )}
        {value && (
          <Button
            size="small"
            variant="outlined"
            color="info"
            startIcon={<EditIcon />}
            onClick={() => {
              if (sigCanvas.current) {
                sigCanvas.current.clear();
                if (onClear) onClear();
              }
            }}
            disabled={disabled}
          >
            Rehacer
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default SignaturePad;