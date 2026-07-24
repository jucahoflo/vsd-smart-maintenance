import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Backup as BackupIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Storage as StorageIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import { useVSD } from '../context/VSDContext';
import { dbService } from '../services/indexedDBService';
import { toast } from 'react-toastify';

const SettingsPage = () => {
  const { loadAllData, isOnline, vsds, maintenances, parts } = useVSD();
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [actionType, setActionType] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const [importData, setImportData] = useState(null);

  const CORRECT_PASSWORD = 'juca7603';
  const MAX_ATTEMPTS = 3;

  const handleOpenPasswordDialog = (action) => {
    setActionType(action);
    setPassword('');
    setPasswordError(false);
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setPassword('');
    setPasswordError(false);
  };

  const handleVerifyPassword = () => {
    if (password === CORRECT_PASSWORD) {
      setPasswordError(false);
      setOpenPasswordDialog(false);
      setPassword('');
      
      switch (actionType) {
        case 'export':
          handleExportData();
          break;
        case 'sync':
          handleSync();
          break;
        case 'clear':
          handleClearData();
          break;
        case 'import':
          handleImportData();
          break;
        default:
          break;
      }
    } else {
      setPasswordError(true);
      setAttempts(prev => prev + 1);
      
      if (attempts + 1 >= MAX_ATTEMPTS) {
        toast.error(`⚠️ Demasiados intentos fallidos. La acción ha sido bloqueada.`);
        setOpenPasswordDialog(false);
        setPassword('');
        setAttempts(0);
      } else {
        toast.error(`❌ Contraseña incorrecta. Intentos restantes: ${MAX_ATTEMPTS - (attempts + 1)}`);
      }
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const data = await dbService.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vsd_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('✅ Datos exportados correctamente');
    } catch (error) {
      toast.error('❌ Error al exportar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async () => {
    if (!importData) {
      toast.warning('⚠️ Selecciona un archivo de backup primero');
      return;
    }

    if (!window.confirm('⚠️ Esto reemplazará TODOS los datos actuales. ¿Estás seguro?')) {
      return;
    }

    try {
      setLoading(true);
      await dbService.importAllData(importData);
      await loadAllData();
      toast.success('✅ Datos importados correctamente');
      setImportData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('❌ Error al importar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setImportData(data);
          toast.success(`✅ Archivo cargado: ${file.name}`);
        } catch (error) {
          toast.error('❌ El archivo no es un backup válido');
          setImportData(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('⚠️ ¿Estás seguro de eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
      try {
        setLoading(true);
        await dbService.clearStore('vsds');
        await dbService.clearStore('maintenances');
        await dbService.clearStore('parts');
        await loadAllData();
        toast.success('✅ Datos eliminados correctamente');
      } catch (error) {
        toast.error('❌ Error al eliminar datos');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      toast.warning('⚠️ No hay conexión a internet');
      return;
    }
    try {
      setLoading(true);
      await loadAllData();
      toast.success('✅ Datos sincronizados correctamente');
    } catch (error) {
      toast.error('❌ Error al sincronizar');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: 200 }} />
        <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
          Procesando...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Configuración
        <Typography variant="body2" color="textSecondary" component="span" ml={2}>
          Administración del sistema
        </Typography>
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper className="p-4">
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Preferencias
            </Typography>
            <FormControlLabel
              control={<Switch checked={notifications} onChange={() => setNotifications(!notifications)} />}
              label="Notificaciones"
            />
            <FormControlLabel
              control={<Switch checked={autoSync} onChange={() => setAutoSync(!autoSync)} />}
              label="Sincronización Automática"
            />
            <Divider sx={{ my: 2 }} />
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Chip
                icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
                label={isOnline ? 'Conectado' : 'Sin Conexión'}
                color={isOnline ? 'success' : 'error'}
              />
              <Chip
                icon={<StorageIcon />}
                label={`${vsds.length} VSDs, ${maintenances.length} Mantenimientos, ${parts.length} Partes`}
                variant="outlined"
              />
            </Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              🔒 Las acciones de gestión de datos requieren contraseña
            </Alert>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="p-4">
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Gestión de Datos
              <Chip 
                icon={<LockIcon />} 
                label="Protegido" 
                size="small" 
                color="warning" 
                sx={{ ml: 1 }}
              />
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card className="card-hover">
                  <CardContent>
                    <BackupIcon color="primary" />
                    <Typography variant="subtitle2" fontWeight="bold" mt={1}>
                      Exportar Datos
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Respaldar todos los datos
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<LockIcon />}
                      onClick={() => handleOpenPasswordDialog('export')}
                      sx={{ mt: 1 }}
                      fullWidth
                      disabled={loading}
                    >
                      Exportar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card className="card-hover">
                  <CardContent>
                    <RestoreIcon color="success" />
                    <Typography variant="subtitle2" fontWeight="bold" mt={1}>
                      Importar Datos
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Restaurar desde backup
                    </Typography>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mt: 1 }}
                      fullWidth
                      disabled={loading}
                    >
                      {importData ? 'Archivo cargado ✅' : 'Seleccionar archivo'}
                      <input
                        type="file"
                        hidden
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                      />
                    </Button>
                    {importData && (
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        startIcon={<LockIcon />}
                        onClick={() => handleOpenPasswordDialog('import')}
                        sx={{ mt: 1 }}
                        fullWidth
                        disabled={loading}
                      >
                        Importar (requiere contraseña)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card className="card-hover">
                  <CardContent>
                    <CloudUploadIcon color="info" />
                    <Typography variant="subtitle2" fontWeight="bold" mt={1}>
                      Sincronizar
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Actualizar datos
                    </Typography>
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      startIcon={<LockIcon />}
                      onClick={() => handleOpenPasswordDialog('sync')}
                      sx={{ mt: 1 }}
                      fullWidth
                      disabled={!isOnline || loading}
                    >
                      Sincronizar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card className="card-hover" sx={{ borderColor: 'error.main', border: '1px dashed' }}>
                  <CardContent>
                    <DeleteIcon color="error" />
                    <Typography variant="subtitle2" fontWeight="bold" mt={1} color="error">
                      Limpiar Todos los Datos
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Eliminar todos los VSDs, mantenimientos y partes
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<LockIcon />}
                      onClick={() => handleOpenPasswordDialog('clear')}
                      sx={{ mt: 1 }}
                      fullWidth
                      disabled={loading}
                    >
                      Limpiar Datos
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper className="p-4">
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Información del Sistema
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="textSecondary">Versión</Typography>
                <Typography variant="body1" fontWeight="500">1.0.0</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="textSecondary">Base de Datos</Typography>
                <Typography variant="body1" fontWeight="500">IndexedDB</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="textSecondary">Modo Offline</Typography>
                <Typography variant="body1" fontWeight="500">
                  {isOnline ? 'Disponible' : 'Activo'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="textSecondary">Registros</Typography>
                <Typography variant="body1" fontWeight="500">
                  {vsds.length + maintenances.length + parts.length}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <LockIcon color="warning" />
            <Typography variant="h6" fontWeight="bold">Verificar Contraseña</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              {actionType === 'export' && '🔐 Ingresa la contraseña para exportar los datos'}
              {actionType === 'import' && '🔐 Ingresa la contraseña para importar los datos'}
              {actionType === 'sync' && '🔐 Ingresa la contraseña para sincronizar los datos'}
              {actionType === 'clear' && '⚠️ Ingresa la contraseña para eliminar todos los datos'}
            </Alert>
            
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              error={passwordError}
              helperText={passwordError ? '❌ Contraseña incorrecta' : ''}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleVerifyPassword();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              autoFocus
            />
            
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Intentos restantes: {MAX_ATTEMPTS - attempts}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Cancelar</Button>
          <Button onClick={handleVerifyPassword} variant="contained" color="primary" startIcon={<LockOpenIcon />}>
            Verificar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;