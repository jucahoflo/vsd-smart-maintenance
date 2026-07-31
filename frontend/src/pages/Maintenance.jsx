import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent, Grid,
  Snackbar, Alert, CircularProgress, Chip, Paper, Divider,
  InputAdornment, FormControl, InputLabel, Select, MenuItem,
  FormGroup, FormControlLabel, Checkbox, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { Search, Refresh, Build, Event, Check, FilePresent } from '@mui/icons-material';
import { supabase } from '../config/supabase';

// 1. DEFINICIÓN DEL CHECKLIST BASADO EN LA IMAGEN
const getDefaultChecklist = () => {
  return {
    shelter_skid: [
      { id: 'ss1', label: 'Limpieza interior y exterior (Piso, puertas, gabinetes)', done: false, anomaly: '', observations: '' },
      { id: 'ss2', label: 'Aspirado y soplado de polvo', done: false, anomaly: '', observations: '' },
      { id: 'ss3', label: 'Ajuste de conexiones de Gabinetes de potencia y VSD (Filtro armónico, Sinusoidal, Cables VSD, Fusibles, reactancias, etc.)', done: false, anomaly: '', observations: '' },
      { id: 'ss4', label: 'Revisión y ajuste de conexiones', done: false, anomaly: '', observations: '' },
      { id: 'ss5', label: 'Verificación de iluminación interna y externa', done: false, anomaly: '', observations: '' },
      { id: 'ss6', label: 'Verificación de subsistema de refrigeración', done: false, anomaly: '', observations: '' },
      { id: 'ss7', label: 'Verificación y ajuste de Bandejas porta cables', done: false, anomaly: '', observations: '' },
      { id: 'ss8', label: 'Verificación estado de ventiladores', done: false, anomaly: '', observations: '' },
      { id: 'ss9', label: 'Revisión de protecciones (PIP, Tem Motor, Temp Intake, Over load, Under Load, etc)', done: false, anomaly: '', observations: '' },
      { id: 'ss10', label: 'Comprobación de la correcta operación de los equipos', done: false, anomaly: '', observations: '' },
    ],
    cbm_vsd: [
      { id: 'cbm1', label: 'Predictivo de Termografía en SCP, ESD, SCA, CSA, VSD, SCP, GFC y CDP.', done: false, anomaly: '', observations: '' },
      { id: 'cbm2', label: 'Predictivo de Calidad de Energía en cada Pozo', done: false, anomaly: '', observations: '' },
      { id: 'cbm3', label: 'Predictivo de Mediciones Eléctricas', done: false, anomaly: '', observations: '' },
    ]
  };
};

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

  // Estado del checklist completo
  const [checklist, setChecklist] = useState(getDefaultChecklist());

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
    setChecklist(getDefaultChecklist());
    
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
    setChecklist(getDefaultChecklist());
  };

  // Funciones para manejar el checklist complejo
  const toggleChecklistItem = (sectionKey, id, field) => {
    setChecklist(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(item => 
        item.id === id ? { ...item, [field]: !item[field] } : item
      )
    }));
  };

  const updateChecklistText = (sectionKey, id, field, value) => {
    setChecklist(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const guardarMantenimiento = async () => {
    if (!vfdEncontrado) return;
    if (!maintenanceForm.descripcion.trim()) {
      showSnackbar('La descripción del mantenimiento es obligatoria', 'warning');
      return;
    }

    setSaving(true);
    try {
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
          // Guardamos el checklist completo y complejo como JSON
          checklist: checklist
        });

      if (error) throw error;
      
      const totalItems = checklist.shelter_skid.length + checklist.cbm_vsd.length;
      const doneItems = [...checklist.shelter_skid, ...checklist.cbm_vsd].filter(i => i.done).length;

      showSnackbar(
        `✅ Mantenimiento registrado para ${vfdEncontrado.codigo_vsd} (${doneItems}/${totalItems} tareas realizadas)`, 
        'success'
      );
      
      // Limpiar formulario
      setMaintenanceForm({ tipo: 'Preventivo', descripcion: '', tecnico: '', costo: '', observations: '' });
      setChecklist(getDefaultChecklist());
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

  // Renderizador de la tabla de checklist
  const renderChecklistSection = (title, sectionKey, items) => (
    <Box mt={2}>
      <Typography variant="subtitle1" fontWeight="700" sx={{ bgcolor: '#f0f0f0', p: 1, borderRadius: 1 }}>
        {title}
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#fafafa' }}>
              <TableCell sx={{ fontWeight: 600, width: '40%' }}>Actividades</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '10%', textAlign: 'center' }}>Hecho (X)</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '25%' }}>Ubicación de anomalías detectadas</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '25%' }}>Observaciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.label}</TableCell>
                <TableCell align="center">
                  <Checkbox 
                    checked={item.done} 
                    onChange={() => toggleChecklistItem(sectionKey, item.id, 'done')}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    variant="standard"
                    placeholder="Escribir anomalía..."
                    value={item.anomaly}
                    onChange={(e) => updateChecklistText(sectionKey, item.id, 'anomaly', e.target.value)}
                    disabled={!item.done}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    variant="standard"
                    placeholder="Observaciones..."
                    value={item.observations}
                    onChange={(e) => updateChecklistText(sectionKey, item.id, 'observations', e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="800" color="primary">
          🔧 Mantenimiento Shelter - Skid
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Busca un VSD para registrar el mantenimiento preventivo y predictivo
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

      {/* --- TARJETA ÚNICA --- */}
      {vfdEncontrado && (
        <Card sx={{ borderRadius: 4, mb: 3, overflow: 'hidden' }}>
          {/* Encabezado del VSD */}
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
            
            {/* 1. CABECERA DEL MANTENIMIENTO */}
            <Typography variant="h6" fontWeight="700" gutterBottom>📋 Datos Generales del Mantenimiento</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Técnico Responsable"
                  value={maintenanceForm.tecnico}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, tecnico: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Costo estimado ($)"
                  type="number"
                  value={maintenanceForm.costo}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, costo: e.target.value })}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Ubicación de la intervención"
                  value={maintenanceForm.observations}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, observations: e.target.value })}
                />
              </Grid>
              
              {/* Observaciones Generales (Ahora es multiline igual que Descripción) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="📝 Descripción de la tarea principal"
                  value={maintenanceForm.descripcion}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, descripcion: e.target.value })}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="📌 Observaciones Generales"
                  value={maintenanceForm.observations}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, observations: e.target.value })}
                  multiline
                  rows={3} // Igualado al tamaño de descripción
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* 2. CHECKLIST COMPLETO (2 Secciones) */}
            {renderChecklistSection('Mantenimiento Preventivo Shelter – Skid', 'shelter_skid', checklist.shelter_skid)}
            {renderChecklistSection('Mantenimiento CBM en VSD', 'cbm_vsd', checklist.cbm_vsd)}

            {/* 3. BOTÓN DE GUARDAR */}
            <Box mt={4} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                size="large"
                startIcon={<FilePresent />}
                onClick={guardarMantenimiento}
                disabled={saving || !maintenanceForm.descripcion.trim()}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                {saving ? 'Guardando...' : 'Finalizar y Generar Reporte'}
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
