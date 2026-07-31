import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent, Grid,
  Snackbar, Alert, CircularProgress, Chip, Paper, Divider,
  InputAdornment, FormControl, InputLabel, Select, MenuItem,
  FormGroup, FormControlLabel, Checkbox, Stack
} from '@mui/material';
import { Search, Refresh, Build, Event, CheckCircle, Cancel, Warning, Check } from '@mui/icons-material';
import { supabase } from '../config/supabase';

// Items predefinidos para el checklist
const DEFAULT_CHECKLIST = [
  { id: 'c1', label: 'Verificar conexiones eléctricas', checked: false },
  { id: 'c2', label: 'Medir voltaje de entrada (V)', checked: false },
  { id: 'c3', label: 'Medir corriente de salida (A)', checked: false },
  { id: 'c4', label: 'Revisar estado de fusibles', checked: false },
  { id: 'c5', label: 'Verificar ventilación / Refrigeración', checked: false },
  { id: 'c6', label: 'Inspeccionar panel de control visual', checked: false },
  { id: 'c7', label: 'Revisar alarmas activas en HMI', checked: false },
  { id: 'c8', label: 'Comprobar comunicación con SCADA', checked: false },
  { id: 'c9', label: 'Resetear contadores de fallos', checked: false },
  { id: 'c10', label: 'Realizar prueba de arranque suave', checked: false }
];

const Maintenance = () => {
  const [searchCode, setSearchCode] = useState('');
  const [vfdEncontrado, setVfdEncontrado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [maintenanceForm, setMaintenanceForm] = useState({
    tipo: 'Preventivo',
    descripcion: '',
    tecnico: '',
    costo: '',
    observations: ''
  });

  // Estado para el checklist
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);

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
    setMaintenanceForm({ tipo: 'Preventivo', descripcion: '', tecnico: '', costo: '', observations: '' });
    setChecklist(DEFAULT_CHECKLIST);
    
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
        showSnackbar(`✅ VSD ${data.codigo_vsd} encontrado`, 'success');
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
    setMaintenanceForm({ tipo: 'Preventivo', descripcion: '', tecnico: '', costo: '', observations: '' });
    setChecklist(DEFAULT_CHECKLIST);
  };

  const toggleChecklistItem = (id) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const guardarMantenimiento = async () => {
    if (!vfdEncontrado) return;
    if (!maintenanceForm.descripcion.trim()) {
      showSnackbar('La descripción del mantenimiento es obligatoria', 'warning');
      return;
    }

    setSaving(true);
    try {
      // Calcular cuántos items del checklist fueron marcados
      const itemsChecked = checklist.filter(item => item.checked).length;
      const totalItems = checklist.length;

      const { error } = await supabase
        .from('maintenance_logs')
        .insert({
          vsd_id: vfdEncontrado.id,
          codigo_vsd: vfdEncontrado.codigo_vsd,
          tipo: maintenanceForm.tipo,
          descripcion: maintenanceForm.descripcion,
          tecnico: maintenanceForm.tecnico || 'No especificado',
          costo: parseFloat(maintenanceForm.costo) || 0,
          observations: maintenanceForm.observations || '',
          // Guardamos el checklist completo como JSON
          checklist: checklist
        });

      if (error) throw error;
      
      showSnackbar(
        `✅ Mantenimiento registrado para ${vfdEncontrado.codigo_vsd} (${itemsChecked}/${totalItems} pruebas realizadas)`, 
        'success'
      );
      
      // Limpiar formulario después de guardar
      setMaintenanceForm({ tipo: 'Preventivo', descripcion: '', tecnico: '', costo: '', observations: '' });
      setChecklist(DEFAULT_CHECKLIST);
    } catch (error) {
      console.error('Error guardando mantenimiento:', error);
      showSnackbar('Error al guardar el mantenimiento', 'error');
    } finally {
      setSaving(false);
    }
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
          🔧 Gestión de Mantenimiento
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Busca un VSD por su código y registra un mantenimiento completo
        </Typography>
      </Box>

      {/* Buscador */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="🔍 Buscar VSD por código"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarVFD()}
              placeholder="Ej: V001, V002, V003"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              disabled={loading || saving}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={buscarVFD}
              disabled={loading || saving || !searchCode.trim()}
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
              disabled={loading || saving}
              startIcon={<Refresh />}
              sx={{ height: 56 }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* --- TARJETA ÚNICA UNIFICADA --- */}
      {vfdEncontrado && (
        <Card sx={{ borderRadius: 4, mb: 3, overflow: 'hidden' }}>
          {/* Encabezado con datos del VSD */}
          <Box sx={{ bgcolor: '#f5f7fa', p: 3, borderBottom: '1px solid #e0e0e0' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h5" fontWeight="800" color="primary">
                    {vfdEncontrado.codigo_vsd}
                  </Typography>
                  <Chip label={getStatusLabel(vfdEncontrado.status)} color={getStatusColor(vfdEncontrado.status)} size="small" />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {vfdEncontrado.manufacturer || 'Sin fabricante'} {vfdEncontrado.model || ''}
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="caption" color="textSecondary">Serial</Typography>
                <Typography variant="body2" fontWeight="600">{vfdEncontrado.serial_number || '-'}</Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="caption" color="textSecondary">Health Score</Typography>
                <Typography variant="body2" fontWeight="600" color={vfdEncontrado.health_score > 80 ? 'success.main' : 'warning.main'}>
                  {vfdEncontrado.health_score}%
                </Typography>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="caption" color="textSecondary">Ubicación</Typography>
                <Typography variant="body2" fontWeight="600">{vfdEncontrado.site || vfdEncontrado.plant || 'N/A'}</Typography>
              </Grid>
            </Grid>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={4}>
              {/* COLUMNA IZQUIERDA: Formulario */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="700" gutterBottom>📋 Datos del Mantenimiento</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo de Mantenimiento</InputLabel>
                      <Select
                        value={maintenanceForm.tipo}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, tipo: e.target.value })}
                        label="Tipo de Mantenimiento"
                      >
                        <MenuItem value="Preventivo">🛡️ Preventivo</MenuItem>
                        <MenuItem value="Correctivo">🔧 Correctivo</MenuItem>
                        <MenuItem value="Predictivo">📊 Predictivo</MenuItem>
                        <MenuItem value="Emergencia">🚨 Emergencia</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Técnico Responsable"
                      value={maintenanceForm.tecnico}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, tecnico: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="📝 Descripción de la tarea"
                      value={maintenanceForm.descripcion}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, descripcion: e.target.value })}
                      multiline
                      rows={2}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="💲 Costo estimado ($)"
                      type="number"
                      value={maintenanceForm.costo}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, costo: e.target.value })}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="📌 Observaciones adicionales"
                      value={maintenanceForm.observations}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, observations: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* COLUMNA DERECHA: Checklist */}
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" fontWeight="700">✅ Checklist de Pruebas</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {checklist.filter(i => i.checked).length}/{checklist.length}
                  </Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflowY: 'auto', bgcolor: '#fafafa' }}>
                  <FormGroup>
                    {checklist.map((item) => (
                      <FormControlLabel
                        key={item.id}
                        control={
                          <Checkbox 
                            checked={item.checked} 
                            onChange={() => toggleChecklistItem(item.id)}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? 'text.secondary' : 'text.primary' }}>
                            {item.label}
                          </Typography>
                        }
                      />
                    ))}
                  </FormGroup>
                </Paper>
              </Grid>
            </Grid>

            {/* Botón de guardar al final */}
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                size="large"
                startIcon={<Check />}
                onClick={guardarMantenimiento}
                disabled={saving || !maintenanceForm.descripcion.trim()}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                {saving ? 'Guardando...' : 'Finalizar y Registrar Mantenimiento'}
              </Button>
            </Box>
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

export default Maintenance;
