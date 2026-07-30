import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, useTheme, useMediaQuery, Snackbar, Alert,
  Tabs, Tab, Divider, Paper, Checkbox, FormControlLabel,
  ImageList, ImageListItem, CircularProgress
} from '@mui/material';
import {
  Add, Refresh, Edit, Delete, Print, Close,
  CheckCircle, Cancel, Schedule, Build,
  PhotoCamera, Description, Download,
  Image as ImageIcon
} from '@mui/icons-material';
import { supabase } from '../config/supabase';
import { uploadImage } from '../services/imageUpload';

const CHECKLIST_DEFAULT = [
  { id: '1', item: 'Limpieza interior y exterior (Piso, puertas, gabinetes)', required: true, status: false, observations: '' },
  { id: '2', item: 'Aspirado y soplado de polvo', required: true, status: false, observations: '' },
  { id: '3', item: 'Ajuste de conexiones de Gabinetes de potencia y VSD (Filtro armónico, Sinusoidal, Cables VSD, Fusibles, reactancias, etc.)', required: true, status: false, observations: '' },
  { id: '4', item: 'Revisión y ajuste de conexiones', required: true, status: false, observations: '' },
  { id: '5', item: 'Verificación de iluminación interna y externa', required: false, status: false, observations: '' },
  { id: '6', item: 'Verificación de subsistema de refrigeración', required: true, status: false, observations: '' },
  { id: '7', item: 'Verificación y ajuste de Bandejas porta cables', required: false, status: false, observations: '' },
  { id: '8', item: 'Verificación estado de ventiladores', required: true, status: false, observations: '' },
  { id: '9', item: 'Revisión de protecciones (PIP, Tem Motor, Temp Intake, Over load, Under Load, etc)', required: true, status: false, observations: '' },
  { id: '10', item: 'Comprobación de la correcta operación de los equipos', required: true, status: false, observations: '' }
];

const MaintenanceReports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [vfdEncontrado, setVfdEncontrado] = useState(null);
  const [photosBefore, setPhotosBefore] = useState([]);
  const [photosAfter, setPhotosAfter] = useState([]);
  
  const fileInputBeforeRef = useRef(null);
  const fileInputAfterRef = useRef(null);

  const [formData, setFormData] = useState({
    vfd_codigo: '',
    vfd_id: '',
    report_date: new Date().toISOString().split('T')[0],
    report_time: new Date().toTimeString().slice(0,5),
    company: '',
    location: '',
    base: '',
    area: '',
    process: '',
    well: '',
    service_ticket: '',
    maintenance_type: 'Preventivo',
    vsd_brand: '',
    vsd_model: '',
    vsd_serial: '',
    vsd_kva: '',
    vsd_amps: '',
    sut_brand: '',
    sut_model: '',
    sut_serial: '',
    sut_kva: '',
    sut_amps: '',
    checklist: CHECKLIST_DEFAULT,
    activities: '',
    parts_changed: [],
    conclusions: '',
    recommendations: '',
    technician_name: '',
    supervisor_name: '',
    status: 'draft',
    fecha_registro: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_reports')
        .select('*, vfds(equipment_id_simple, manufacturer, model)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const buscarVFDporCodigo = async (codigo) => {
    if (!codigo || codigo.length < 3) {
      setVfdEncontrado(null);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('vfds')
        .select('*')
        .eq('equipment_id_simple', codigo.toUpperCase())
        .single();

      if (error) {
        setVfdEncontrado(null);
        setFormData(prev => ({ ...prev, vfd_id: '', vfd_codigo: '' }));
        showSnackbar(`❌ No se encontró VFD con código ${codigo}`, 'warning');
      } else if (data) {
        setVfdEncontrado(data);
        setFormData(prev => ({ 
          ...prev, 
          vfd_id: data.id,
          vfd_codigo: data.equipment_id_simple 
        }));
        showSnackbar(`✅ VFD encontrado: ${data.equipment_id_simple} - ${data.manufacturer || 'Sin fabricante'}`, 'success');
      }
    } catch (error) {
      console.error('Error buscando VFD:', error);
      setVfdEncontrado(null);
      setFormData(prev => ({ ...prev, vfd_id: '', vfd_codigo: '' }));
      showSnackbar(`❌ No se encontró VFD con código ${codigo}`, 'warning');
    } finally {
      setSearching(false);
    }
  };

  const handleChecklistChange = (id, field, value) => {
    setFormData({
      ...formData,
      checklist: formData.checklist.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const handlePhotoUpload = async (file, type) => {
    if (!file) return;
    
    try {
      setUploading(true);
      const reportId = editing?.id || 'temp';
      const url = await uploadImage(file, `report_${reportId}`, Date.now());
      
      if (url) {
        const newPhoto = { image_url: url, type, description: '' };
        if (type === 'before') {
          setPhotosBefore([...photosBefore, newPhoto]);
        } else {
          setPhotosAfter([...photosAfter, newPhoto]);
        }
        showSnackbar('✅ Foto subida correctamente');
      }
    } catch (error) {
      showSnackbar(error.message || 'Error al subir foto', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (index, type) => {
    if (type === 'before') {
      setPhotosBefore(photosBefore.filter((_, i) => i !== index));
    } else {
      setPhotosAfter(photosAfter.filter((_, i) => i !== index));
    }
  };

  const handleOpen = (report = null) => {
    if (report) {
      setEditing(report);
      setFormData({
        ...report,
        checklist: report.checklist || CHECKLIST_DEFAULT,
        vfd_codigo: report.vfd_codigo || '',
        vfd_id: report.vfd_id || '',
        fecha_registro: report.fecha_registro || new Date().toISOString().split('T')[0]
      });
      if (report.vfd_codigo) {
        buscarVFDporCodigo(report.vfd_codigo);
      }
      setPhotosBefore([]);
      setPhotosAfter([]);
    } else {
      setEditing(null);
      setFormData({
        vfd_codigo: '',
        vfd_id: '',
        report_date: new Date().toISOString().split('T')[0],
        report_time: new Date().toTimeString().slice(0,5),
        company: '',
        location: '',
        base: '',
        area: '',
        process: '',
        well: '',
        service_ticket: '',
        maintenance_type: 'Preventivo',
        vsd_brand: '',
        vsd_model: '',
        vsd_serial: '',
        vsd_kva: '',
        vsd_amps: '',
        sut_brand: '',
        sut_model: '',
        sut_serial: '',
        sut_kva: '',
        sut_amps: '',
        checklist: CHECKLIST_DEFAULT,
        activities: '',
        parts_changed: [],
        conclusions: '',
        recommendations: '',
        technician_name: '',
        supervisor_name: '',
        status: 'draft',
        fecha_registro: new Date().toISOString().split('T')[0]
      });
      setVfdEncontrado(null);
      setPhotosBefore([]);
      setPhotosAfter([]);
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditing(null);
    setVfdEncontrado(null);
  };

  const handleSave = async () => {
    try {
      if (!formData.vfd_id) {
        showSnackbar('❌ Primero busca y selecciona un VFD válido', 'error');
        return;
      }

      const dataToSend = {
        vfd_id: formData.vfd_id,
        vfd_codigo: formData.vfd_codigo,
        report_date: formData.report_date,
        report_time: formData.report_time,
        company: formData.company,
        location: formData.location,
        base: formData.base,
        area: formData.area,
        process: formData.process,
        well: formData.well,
        service_ticket: formData.service_ticket,
        maintenance_type: formData.maintenance_type,
        vsd_brand: formData.vsd_brand,
        vsd_model: formData.vsd_model,
        vsd_serial: formData.vsd_serial,
        vsd_kva: formData.vsd_kva,
        vsd_amps: formData.vsd_amps,
        sut_brand: formData.sut_brand,
        sut_model: formData.sut_model,
        sut_serial: formData.sut_serial,
        sut_kva: formData.sut_kva,
        sut_amps: formData.sut_amps,
        checklist: formData.checklist,
        activities: formData.activities,
        parts_changed: formData.parts_changed,
        conclusions: formData.conclusions,
        recommendations: formData.recommendations,
        technician_name: formData.technician_name,
        supervisor_name: formData.supervisor_name,
        status: formData.status,
        fecha_registro: formData.fecha_registro || new Date().toISOString().split('T')[0]
      };

      if (editing) {
        const { error } = await supabase
          .from('maintenance_reports')
          .update(dataToSend)
          .eq('id', editing.id);
        if (error) throw error;
        showSnackbar('✅ Reporte actualizado');
      } else {
        const { error } = await supabase
          .from('maintenance_reports')
          .insert([dataToSend]);
        if (error) throw error;
        showSnackbar('✅ Reporte creado');
      }
      handleClose();
      loadData();
    } catch (error) {
      showSnackbar(error.message || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este reporte?')) {
      try {
        const { error } = await supabase
          .from('maintenance_reports')
          .delete()
          .eq('id', id);
        if (error) throw error;
        showSnackbar('✅ Reporte eliminado');
        loadData();
      } catch (error) {
        showSnackbar('Error al eliminar', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'approved': return theme.palette.primary.main;
      case 'draft': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  const filteredReports = tabValue === 0 
    ? reports 
    : reports.filter(r => {
        if (tabValue === 1) return r.status === 'draft';
        if (tabValue === 2) return r.status === 'completed';
        if (tabValue === 3) return r.status === 'approved';
        return true;
      });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Cargando reportes...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2} mb={3}>
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" className="gradient-text">
            📋 Reportes de Mantenimiento
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gestión de reportes completos con checklist y fotos
          </Typography>
        </Box>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{ borderRadius: 3 }}
            size={isMobile ? "small" : "medium"}
          >
            {isMobile ? 'Nuevo' : 'Nuevo Reporte'}
          </Button>
          <IconButton onClick={loadData} sx={{ bgcolor: 'rgba(108,99,255,0.1)' }}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Todos" />
        <Tab label="Borradores" />
        <Tab label="Completados" />
        <Tab label="Aprobados" />
      </Tabs>

      <Grid container spacing={3}>
        {filteredReports.map((report) => (
          <Grid item xs={12} md={6} lg={4} key={report.id}>
            <Card sx={{ borderRadius: 4, transition: 'all 0.3s ease' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      {report.report_number}
                    </Typography>
                    <Typography variant="h6" fontWeight="700">
                      {report.vfd_codigo || 'Sin código'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {report.maintenance_type || '--'}
                    </Typography>
                  </Box>
                  <Chip
                    label={report.status}
                    size="small"
                    sx={{
                      bgcolor: `${getStatusColor(report.status)}20`,
                      color: getStatusColor(report.status),
                      fontWeight: 600
                    }}
                  />
                </Box>

                <Box mt={2}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Fecha</Typography>
                      <Typography variant="body2">{report.report_date || '--'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Checklist</Typography>
                      <Typography variant="body2">
                        {report.checklist?.filter(c => c.status).length || 0} de {report.checklist?.length || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">Técnico</Typography>
                      <Typography variant="body2">{report.technician_name || '--'}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                  <Button size="small" startIcon={<Description />} onClick={() => handleOpen(report)}>
                    Ver
                  </Button>
                  <IconButton size="small" onClick={() => handleOpen(report)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(report.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredReports.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No hay reportes de mantenimiento
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="700">
            {editing ? '✏️ Editar Reporte' : '📋 Nuevo Reporte de Mantenimiento'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Box display="flex" gap={1} alignItems="center">
                <TextField
                  fullWidth
                  label="🔑 Código del VFD (ej: V001)"
                  value={formData.vfd_codigo}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setFormData({...formData, vfd_codigo: value});
                    if (value.length >= 3) {
                      buscarVFDporCodigo(value);
                    } else {
                      setVfdEncontrado(null);
                    }
                  }}
                  placeholder="Ingresa el código del VFD"
                  helperText={vfdEncontrado ? `✅ ${vfdEncontrado.equipment_id_simple} - ${vfdEncontrado.manufacturer || 'Sin fabricante'}` : 'Ej: V001, V002'}
                  disabled={searching}
                />
                {searching && <CircularProgress size={24} />}
              </Box>
              {vfdEncontrado && (
                <Box mt={1} p={1} bgcolor="success.light" borderRadius={1}>
                  <Typography variant="body2">
                    📌 {vfdEncontrado.equipment_id_simple} - {vfdEncontrado.manufacturer || 'Sin fabricante'} {vfdEncontrado.model || ''}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" color="primary">
                📌 Datos Generales
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha"
                type="date"
                value={formData.report_date}
                onChange={(e) => setFormData({...formData, report_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hora"
                type="time"
                value={formData.report_time}
                onChange={(e) => setFormData({...formData, report_time: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Compañía"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Locación"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Pozo"
                value={formData.well}
                onChange={(e) => setFormData({...formData, well: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Mantenimiento</InputLabel>
                <Select
                  value={formData.maintenance_type}
                  onChange={(e) => setFormData({...formData, maintenance_type: e.target.value})}
                  label="Tipo de Mantenimiento"
                >
                  <MenuItem value="Preventivo">Preventivo</MenuItem>
                  <MenuItem value="Correctivo">Correctivo</MenuItem>
                  <MenuItem value="Predictivo">Predictivo</MenuItem>
                  <MenuItem value="Emergencia">Emergencia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Service Ticket"
                value={formData.service_ticket}
                onChange={(e) => setFormData({...formData, service_ticket: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" color="secondary" sx={{ mt: 1 }}>
                ✅ Checklist de Mantenimiento
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                {formData.checklist.map((item) => (
                  <Box key={item.id} sx={{ mb: 2, pb: 1, borderBottom: '1px solid #f0f0f0' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Checkbox
                        checked={item.status || false}
                        onChange={(e) => handleChecklistChange(item.id, 'status', e.target.checked)}
                        size="small"
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {item.item}
                        {item.required && <Chip label="Req" size="small" color="error" sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} />}
                      </Typography>
                    </Box>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Observaciones"
                      value={item.observations || ''}
                      onChange={(e) => handleChecklistChange(item.id, 'observations', e.target.value)}
                      sx={{ mt: 0.5, ml: 4, width: 'calc(100% - 32px)' }}
                    />
                  </Box>
                ))}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" sx={{ mt: 1 }}>
                📸 Fotos
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" fontWeight="600">ANTES (máx 5)</Typography>
                  <Box sx={{ border: '1px dashed #ccc', borderRadius: 2, p: 2, minHeight: 100 }}>
                    <ImageList cols={2} rowHeight={80}>
                      {photosBefore.map((photo, index) => (
                        <ImageListItem key={index} sx={{ position: 'relative' }}>
                          <img src={photo.image_url} alt={`Antes ${index+1}`} style={{ height: 80, objectFit: 'cover', borderRadius: 4 }} />
                          <IconButton size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }} onClick={() => handleRemovePhoto(index, 'before')}>
                            <Close fontSize="small" />
                          </IconButton>
                        </ImageListItem>
                      ))}
                      {photosBefore.length < 5 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, border: '1px dashed #ccc', borderRadius: 2, cursor: 'pointer' }} onClick={() => fileInputBeforeRef.current?.click()}>
                          <PhotoCamera />
                          <Typography variant="caption">Subir</Typography>
                        </Box>
                      )}
                    </ImageList>
                    <input ref={fileInputBeforeRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhotoUpload(e.target.files[0], 'before')} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" fontWeight="600">DESPUÉS (máx 5)</Typography>
                  <Box sx={{ border: '1px dashed #ccc', borderRadius: 2, p: 2, minHeight: 100 }}>
                    <ImageList cols={2} rowHeight={80}>
                      {photosAfter.map((photo, index) => (
                        <ImageListItem key={index} sx={{ position: 'relative' }}>
                          <img src={photo.image_url} alt={`Después ${index+1}`} style={{ height: 80, objectFit: 'cover', borderRadius: 4 }} />
                          <IconButton size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }} onClick={() => handleRemovePhoto(index, 'after')}>
                            <Close fontSize="small" />
                          </IconButton>
                        </ImageListItem>
                      ))}
                      {photosAfter.length < 5 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, border: '1px dashed #ccc', borderRadius: 2, cursor: 'pointer' }} onClick={() => fileInputAfterRef.current?.click()}>
                          <PhotoCamera />
                          <Typography variant="caption">Subir</Typography>
                        </Box>
                      )}
                    </ImageList>
                    <input ref={fileInputAfterRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhotoUpload(e.target.files[0], 'after')} />
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" color="info" sx={{ mt: 1 }}>
                📝 Actividades Realizadas
              </Typography>
              <Divider sx={{ my: 1 }} />
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.activities}
                onChange={(e) => setFormData({...formData, activities: e.target.value})}
                placeholder="Describa las actividades realizadas durante el mantenimiento..."
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" color="info" sx={{ mt: 1 }}>
                📋 Conclusiones y Recomendaciones
              </Typography>
              <Divider sx={{ my: 1 }} />
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.conclusions}
                onChange={(e) => setFormData({...formData, conclusions: e.target.value})}
                placeholder="Conclusiones..."
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.recommendations}
                onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                placeholder="Recomendaciones..."
                sx={{ mt: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" sx={{ mt: 1 }}>
                👤 Responsables
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Técnico"
                    value={formData.technician_name}
                    onChange={(e) => setFormData({...formData, technician_name: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Supervisor"
                    value={formData.supervisor_name}
                    onChange={(e) => setFormData({...formData, supervisor_name: e.target.value})}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  label="Estado"
                >
                  <MenuItem value="draft">Borrador</MenuItem>
                  <MenuItem value="completed">Completado</MenuItem>
                  <MenuItem value="approved">Aprobado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!vfdEncontrado}>
            {editing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MaintenanceReports;
