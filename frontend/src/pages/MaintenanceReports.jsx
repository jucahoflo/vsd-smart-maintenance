import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent, Grid,
  Snackbar, Alert, CircularProgress, Chip, Paper, Divider, IconButton,
  InputAdornment
} from '@mui/material';
import { Search, Refresh, CheckCircle, Cancel } from '@mui/icons-material';
import { supabase } from '../config/supabase';

const MaintenanceReports = () => {
  const [searchCode, setSearchCode] = useState('');
  const [vfdEncontrado, setVfdEncontrado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const buscarVFD = async () => {
    if (!searchCode.trim()) {
      showSnackbar('Ingresa un código de VSD válido (Ej: V001)', 'warning');
      return;
    }

    setLoading(true);
    setVfdEncontrado(null);
    try {
      const codigo = searchCode.trim().toUpperCase();
      const { data, error } = await supabase
        .from('vsd')
        .select('*')
        .eq('codigo_vsd', codigo)
        .single();

      if (error) throw error;
      
      if (data) {
        setVfdEncontrado(data);
        showSnackbar(`✅ VSD encontrado: ${data.codigo_vsd} - ${data.manufacturer || 'Sin fabricante'}`, 'success');
      } else {
        showSnackbar(`❌ No se encontró el VSD con código ${codigo}`, 'error');
      }
    } catch (error) {
      console.error('Error buscando VSD:', error);
      showSnackbar('Error al buscar el VSD', 'error');
    } finally {
      setLoading(false);
    }
  };

  const limpiarBusqueda = () => {
    setSearchCode('');
    setVfdEncontrado(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'alarm': return 'warning';
      case 'maintenance': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'online': return '🟢 Online';
      case 'offline': return '🔴 Offline';
      case 'alarm': return '🟡 Alarma';
      case 'maintenance': return '🔧 Mantenimiento';
      default: return status;
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="800" color="primary">
          📊 Reportes de Mantenimiento
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Busca un VSD para ver su historial de reportes
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="🔍 Buscar VSD por código"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && buscarVFD()}
              placeholder="Ej: V001, V002, V003"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={buscarVFD}
              disabled={loading || !searchCode.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{ height: 56 }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={limpiarBusqueda}
              disabled={loading}
              startIcon={<Refresh />}
              sx={{ height: 56 }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {vfdEncontrado && (
        <Card sx={{ borderRadius: 4, p: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
              <Box>
                <Typography variant="h5" fontWeight="800" color="primary">
                  {vfdEncontrado.codigo_vsd}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  {vfdEncontrado.manufacturer || 'Fabricante no especificado'} {vfdEncontrado.model || ''}
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" alignItems="flex-end">
                <Chip label={getStatusLabel(vfdEncontrado.status)} color={getStatusColor(vfdEncontrado.status)} size="medium" />
                <Box mt={1} display="flex" alignItems="center">
                  <Speed sx={{ mr: 1, color: vfdEncontrado.health_score > 80 ? 'success.main' : 'warning.main' }} />
                  <Typography variant="h6" fontWeight="700">{vfdEncontrado.health_score}%</Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary" display="block">📋 Modelo</Typography>
                <Typography variant="body1">{vfdEncontrado.model || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary" display="block">🏭 Fabricante</Typography>
                <Typography variant="body1">{vfdEncontrado.manufacturer || '-'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

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

export default MaintenanceReports;
