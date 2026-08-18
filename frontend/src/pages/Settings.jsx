import React from 'react';
import { Box, Typography, Card, CardContent, Button, Alert } from '@mui/material';

const Settings = () => {
  const handleClearData = () => {
    if (window.confirm('¿Estás seguro de borrar todos los datos locales?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Configuración</Typography>
      
      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Datos</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Los datos se guardan localmente en tu navegador.
          </Alert>
          <Button
            variant="outlined"
            color="error"
            onClick={handleClearData}
          >
            Borrar todos los datos locales
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
