import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Switch, FormControlLabel,
  Button, Chip, Divider, Alert, CircularProgress, Stack
} from '@mui/material';
import { Sync, CloudDone, CloudOff, Wifi, WifiOff } from '@mui/icons-material';
import { useSync } from '../context/SyncContext';

const Settings = () => {
  const {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncData,
    offlineQueue
  } = useSync();

  const [autoSync, setAutoSync] = useState(true);

  const handleSync = async () => {
    await syncData(true);
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="800" color="primary">
          ⚙️ Configuración y Sincronización
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Gestiona el modo offline y la sincronización de datos con la nube
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Tarjeta de Estado de Conexión */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="700" gutterBottom>
              📡 Estado de Conexión
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              {isOnline ? (
                <Chip icon={<Wifi />} label="Online - Conectado" color="success" size="medium" />
              ) : (
                <Chip icon={<WifiOff />} label="Offline - Sin conexión" color="error" size="medium" />
              )}
            </Box>
            <Typography variant="body2" color="textSecondary">
              Última sincronización: {lastSyncTime || 'Nunca'}
            </Typography>
            <Box mt={2}>
              <Typography variant="caption" color="textSecondary">
                Pendientes por sincronizar: {offlineQueue.length} acciones
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Tarjeta de Acciones */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="700" gutterBottom>
              🔄 Sincronización
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="contained"
                startIcon={isSyncing ? <CircularProgress size={20} /> : <Sync />}
                onClick={handleSync}
                disabled={isSyncing || !isOnline}
                fullWidth
                sx={{ borderRadius: 3, height: 50 }}
              >
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
              </Button>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    disabled={!isOnline}
                  />
                }
                label="Sincronización automática cada 5 minutos"
              />
              {!isOnline && (
                <Alert severity="info" icon={<CloudOff />}>
                  Estás en modo offline. Los cambios se guardarán localmente y se sincronizarán cuando la conexión regrese.
                </Alert>
              )}
              {isOnline && offlineQueue.length > 0 && (
                <Alert severity="warning" icon={<CloudDone />}>
                  Tienes {offlineQueue.length} cambios pendientes por subir a la nube.
                </Alert>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Información adicional */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="700" gutterBottom>
              ℹ️ ¿Cómo funciona el modo Offline?
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              <strong>1. Al cargar la app con internet:</strong> La app descarga todos los datos de VSDs, Mantenimientos e Inventario y los guarda en el almacenamiento local de tu navegador.
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              <strong>2. En modo Offline:</strong> Puedes ver, editar y crear nuevos VSDs y partes. Todos los cambios se guardan en una cola local.
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              <strong>3. Al recuperar la conexión:</strong> Puedes hacer clic en "Sincronizar Ahora" para subir todos los cambios a la nube y descargar los datos más recientes.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
