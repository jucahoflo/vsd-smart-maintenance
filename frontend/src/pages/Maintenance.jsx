import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent, Grid,
  Snackbar, Alert, CircularProgress, Chip, Paper, Divider,
  InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Avatar, Stack, Tooltip
} from '@mui/material';
import { Search, Refresh, FilePresent, CloudUpload, DeleteForever, PhotoCamera, Add, Delete, ArrowBack } from '@mui/icons-material';
import { supabase } from '../config/supabase';
import { useSearchParams, useNavigate } from 'react-router-dom';

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
    ],
    static_tests: {
      converter_1: [
        { meter_plus: 'DC BUS +', meter_minus: 'Entrada R', expected: 'Cargando', actual: '' },
        { meter_plus: 'DC BUS +', meter_minus: 'Entrada S', expected: 'Cargando', actual: '' },
        { meter_plus: 'DC BUS +', meter_minus: 'Entrada T', expected: 'Cargando', actual: '' },
        { meter_plus: 'Entrada R', meter_minus: 'DC BUS +', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'Entrada S', meter_minus: 'DC BUS +', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'Entrada T', meter_minus: 'DC BUS +', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'DC Bus –', meter_minus: 'Entrada R', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'DC Bus –', meter_minus: 'Entrada S', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'DC Bus –', meter_minus: 'Entrada T', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'Entrada R', meter_minus: 'DC Bus –', expected: 'Cargando', actual: '' },
        { meter_plus: 'Entrada S', meter_minus: 'DC Bus –', expected: 'Cargando', actual: '' },
        { meter_plus: 'Entrada T', meter_minus: 'DC Bus –', expected: 'Cargando', actual: '' },
      ],
      inverter_2: [
        { meter_plus: 'DC BUS +', meter_minus: 'Entrada R', expected: 'Cargando', actual: '' },
        { meter_plus: 'DC BUS +', meter_minus: 'Entrada S', expected: 'Cargando', actual: '' },
        { meter_plus: 'DC BUS +', meter_minus: 'Entrada T', expected: 'Cargando', actual: '' },
        { meter_plus: 'Entrada R', meter_minus: 'DC BUS +', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'Entrada S', meter_minus: 'DC BUS +', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'Entrada T', meter_minus: 'DC BUS +', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'DC Bus –', meter_minus: 'Entrada R', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'DC Bus –', meter_minus: 'Entrada S', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'DC Bus –', meter_minus: 'Entrada T', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'Entrada R', meter_minus: 'DC Bus –', expected: 'Cargando', actual: '' },
        { meter_plus: 'Entrada S', meter_minus: 'DC Bus –', expected: 'Cargando', actual: '' },
        { meter_plus: 'Entrada T', meter_minus: 'DC Bus –', expected: 'Cargando', actual: '' },
      ],
      converter_3: [
        { meter_plus: 'DC BUS +', meter_minus: 'Entrada R', expected: 'Cargando', actual: '' },
        { meter_plus: 'DC BUS +', meter_minus: 'Entrada S', expected: 'Cargando', actual: '' },
        { meter_plus: 'DC BUS +', meter_minus: 'Entrada T', expected: 'Cargando', actual: '' },
        { meter_plus: 'Entrada R', meter_minus: 'DC BUS +', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'Entrada S', meter_minus: 'DC BUS +', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'Entrada T', meter_minus: 'DC BUS +', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'DC Bus –', meter_minus: 'Entrada R', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'DC Bus –', meter_minus: 'Entrada S', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'DC Bus –', meter_minus: 'Entrada T', expected: '0.2 – 0.6', actual: '' },
        { meter_plus: 'Entrada R', meter_minus: 'DC Bus –', expected: 'Cargando', actual: '' },
        { meter_plus: 'Entrada S', meter_minus: 'DC Bus –', expected: 'Cargando', actual: '' },
        { meter_plus: 'Entrada T', meter_minus: 'DC Bus –', expected: 'Cargando', actual: '' },
      ]
    },
    photos: {
      before: [],
      after: []
    },
    materials: [
      { item: 1, quantity: 1, sap_code: '', detail: '', reserve: '' }
    ]
  };
};

const Maintenance = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reportId = searchParams.get('reportId');

  const [searchCode, setSearchCode] = useState('');
  const [vfdEncontrado, setVfdEncontrado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isEditingReport, setIsEditingReport] = useState(false);
  
  const [maintenanceForm, setMaintenanceForm] = useState({
    tipo: 'Preventivo',
    descripcion: '',
    tecnico: '',
    costo: '',
    observations: '',
    fecha_inicio: '',
    fecha_fin: '',
    sitio: '',
    pozo: '',
    modulo_produccion: '',
    taller: '',
    conclusiones: ''
  });

  const [checklist, setChecklist] = useState(getDefaultChecklist());

  useEffect(() => {
    if (reportId) {
      loadReportForEdit(reportId);
    }
  }, [reportId]);

  const loadReportForEdit = async (id) => {
    setLoading(true);
    setIsEditingReport(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_logs')
        .select('*, vsd:vsd_id(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setVfdEncontrado(data.vsd);
        setMaintenanceForm({
          tipo: data.tipo || 'Preventivo',
          descripcion: data.descripcion || '',
          tecnico: data.tecnico || '',
          costo: data.costo || '',
          observations: data.observations || '',
          fecha_inicio: data.fecha_inicio || '',
          fecha_fin: data.fecha_fin || '',
          sitio: data.sitio || '',
          pozo: data.pozo || '',
          modulo_produccion: data.modulo_produccion || '',
          taller: data.taller || '',
          conclusiones: data.conclusiones || ''
        });
        setChecklist(data.checklist || getDefaultChecklist());
      }
    } catch (error) {
      console.error('Error loading report:', error);
      showSnackbar('Error al cargar el reporte para editar', 'error');
    } finally {
      setLoading(false);
    }
  };

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
    setMaintenanceForm({
      tipo: 'Preventivo',
      descripcion: '',
      tecnico: '',
      costo: '',
      observations: '',
      fecha_inicio: '',
      fecha_fin: '',
      sitio: '',
      pozo: '',
      modulo_produccion: '',
      taller: '',
      conclusiones: ''
    });
    setChecklist(getDefaultChecklist());
    setIsEditingReport(false);
    
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
    setMaintenanceForm({
      tipo: 'Preventivo',
      descripcion: '',
      tecnico: '',
      costo: '',
      observations: '',
      fecha_inicio: '',
      fecha_fin: '',
      sitio: '',
      pozo: '',
      modulo_produccion: '',
      taller: '',
      conclusiones: ''
    });
    setChecklist(getDefaultChecklist());
    setIsEditingReport(false);
    navigate('/maintenance');
  };

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

  const updateStaticTestValue = (testKey, index, value) => {
    setChecklist(prev => ({
      ...prev,
      static_tests: {
        ...prev.static_tests,
        [testKey]: prev.static_tests[testKey].map((item, i) => 
          i === index ? { ...item, actual: value } : item
        )
      }
    }));
  };

  const uploadPhoto = async (file, stage) => {
    if (!file || !vfdEncontrado) return;
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `mant_${vfdEncontrado.codigo_vsd}_${stage}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vsd_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('vsd_images')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      
      setChecklist(prev => ({
        ...prev,
        photos: {
          ...prev.photos,
          [stage]: [...prev.photos[stage], publicUrl]
        }
      }));

      showSnackbar(`✅ Foto de ${stage === 'before' ? 'Antes' : 'Después'} subida`, 'success');
    } catch (error) {
      console.error('Error uploading photo:', error);
      showSnackbar('❌ Error al subir la foto', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const removePhoto = (stage, index) => {
    setChecklist(prev => ({
      ...prev,
      photos: {
        ...prev.photos,
        [stage]: prev.photos[stage].filter((_, i) => i !== index)
      }
    }));
  };

  const addMaterial = () => {
    setChecklist(prev => ({
      ...prev,
      materials: [
        ...prev.materials,
        { 
          item: prev.materials.length + 1, 
          quantity: 1, 
          sap_code: '', 
          detail: '', 
          reserve: '' 
        }
      ]
    }));
  };

  const removeMaterial = (index) => {
    if (checklist.materials.length === 1) return;
    const updatedMaterials = checklist.materials.filter((_, i) => i !== index);
    const reindexed = updatedMaterials.map((mat, i) => ({ ...mat, item: i + 1 }));
    setChecklist(prev => ({
      ...prev,
      materials: reindexed
    }));
  };

  const updateMaterial = (index, field, value) => {
    setChecklist(prev => ({
      ...prev,
      materials: prev.materials.map((mat, i) => 
        i === index ? { ...mat, [field]: value } : mat
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
      let nextNumber = '01';
      
      if (!isEditingReport) {
        // Si es nuevo, calcular el siguiente número
        const { data: lastMaint, error: countError } = await supabase
          .from('maintenance_logs')
          .select('maintenance_number')
          .eq('codigo_vsd', vfdEncontrado.codigo_vsd)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (countError) throw countError;

        if (lastMaint && lastMaint.maintenance_number) {
          const currentNum = parseInt(lastMaint.maintenance_number);
          nextNumber = String(currentNum + 1).padStart(2, '0');
        }
      }

      const dataToSend = {
        vsd_id: vfdEncontrado.id,
        codigo_vsd: vfdEncontrado.codigo_vsd,
        maintenance_number: isEditingReport ? undefined : nextNumber,
        tipo: maintenanceForm.tipo || 'Preventivo',
        descripcion: maintenanceForm.descripcion,
        tecnico: maintenanceForm.tecnico || 'No especificado',
        costo: parseFloat(maintenanceForm.costo) || 0,
        observations: maintenanceForm.observations || '',
        fecha_inicio: maintenanceForm.fecha_inicio?.trim() === '' ? null : maintenanceForm.fecha_inicio,
        fecha_fin: maintenanceForm.fecha_fin?.trim() === '' ? null : maintenanceForm.fecha_fin,
        sitio: maintenanceForm.sitio || '',
        pozo: maintenanceForm.pozo || '',
        modulo_produccion: maintenanceForm.modulo_produccion || '',
        taller: maintenanceForm.taller || '',
        conclusiones: maintenanceForm.conclusiones || '',
        checklist: checklist
      };

      console.log('📤 Enviando datos a Supabase:', dataToSend);

      if (isEditingReport) {
        // ACTUALIZAR REPORTE EXISTENTE
        const { error } = await supabase
          .from('maintenance_logs')
          .update(dataToSend)
          .eq('id', reportId);
        if (error) throw error;
        showSnackbar('✅ Reporte actualizado correctamente', 'success');
      } else {
        // CREAR NUEVO REPORTE
        const { error } = await supabase
          .from('maintenance_logs')
          .insert(dataToSend);
        if (error) throw error;
        showSnackbar(`✅ Mantenimiento #${nextNumber} registrado`, 'success');
      }
      
      setMaintenanceForm({
        tipo: 'Preventivo',
        descripcion: '',
        tecnico: '',
        costo: '',
        observations: '',
        fecha_inicio: '',
        fecha_fin: '',
        sitio: '',
        pozo: '',
        modulo_produccion: '',
        taller: '',
        conclusiones: ''
      });
      setChecklist(getDefaultChecklist());
      setIsEditingReport(false);
      navigate('/reports');
    } catch (error) {
      console.error('❌ Error guardando mantenimiento:', error);
      showSnackbar('Error al guardar el mantenimiento: ' + (error.message || error.error_description || 'Error desconocido'), 'error');
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
              <TableCell sx={{ fontWeight: 600, width: '25%' }}>Anomalías detectadas</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '25%' }}>Observaciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.label}</TableCell>
                <TableCell align="center">
                  <input 
                    type="checkbox"
                    checked={item.done} 
                    onChange={() => toggleChecklistItem(sectionKey, item.id, 'done')}
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    variant="standard"
                    placeholder="..."
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
                    placeholder="..."
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

  const renderStaticTestTable = (title, testKey, items) => (
    <Box mt={3}>
      <Typography variant="subtitle1" fontWeight="700" sx={{ bgcolor: '#1976d2', color: 'white', p: 1, borderRadius: 1 }}>
        {title}
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#e3f2fd' }}>
              <TableCell sx={{ fontWeight: 700, width: '25%' }}>Meter +</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '25%' }}>Meter –</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '25%' }}>Lectura esperada</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '25%' }}>Lectura actual</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row, index) => (
              <TableRow key={index}>
                <TableCell sx={{ fontWeight: 500 }}>{row.meter_plus}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{row.meter_minus}</TableCell>
                <TableCell>{row.expected}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    variant="standard"
                    placeholder="Escribe el valor..."
                    value={row.actual}
                    onChange={(e) => updateStaticTestValue(testKey, index, e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderPhotoSection = (title, stage) => {
    const photos = checklist.photos[stage];
    return (
      <Box mt={3}>
        <Typography variant="subtitle1" fontWeight="700" sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>📷 {title} ({photos.length}/5)</span>
          {photos.length < 5 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={uploadingImage ? <CircularProgress size={20} /> : <CloudUpload />}
              component="label"
              disabled={uploadingImage}
            >
              Subir foto
              <input
                type="file"
                hidden
                accept="image/*"
                capture="environment"
                onChange={(e) => uploadPhoto(e.target.files[0], stage)}
              />
            </Button>
          )}
        </Typography>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {photos.map((url, index) => (
            <Grid item xs={4} sm={3} md={2} key={index}>
              <Box sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 2, p: 0.5, textAlign: 'center' }}>
                <Avatar variant="rounded" src={url} sx={{ width: '100%', height: 80, objectFit: 'cover' }} />
                <IconButton 
                  size="small" 
                  color="error" 
                  sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', boxShadow: 1 }}
                  onClick={() => removePhoto(stage, index)}
                >
                  <DeleteForever fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          ))}
          {photos.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">No hay fotos subidas para esta sección.</Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const renderMaterialsTable = () => {
    return (
      <Box mt={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#00897b' }}>
            📦 Descripción Accesorios Cambiados
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<Add />} 
            onClick={addMaterial}
            sx={{ borderRadius: 2 }}
          >
            Agregar Material
          </Button>
        </Box>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell sx={{ fontWeight: 600, width: '8%', textAlign: 'center' }}>Ítem</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '12%', textAlign: 'center' }}>Cantidad</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '20%' }}>CODIGO SAP</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '45%' }}>Detalle</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '15%' }}>Reserva</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '5%', textAlign: 'center' }}>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checklist.materials.map((row, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{row.item}</TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      variant="standard"
                      type="number"
                      value={row.quantity}
                      onChange={(e) => updateMaterial(index, 'quantity', e.target.value)}
                      inputProps={{ min: 1, style: { textAlign: 'center', width: '50px' } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      variant="standard"
                      placeholder="Ejm: 1000266315"
                      value={row.sap_code}
                      onChange={(e) => updateMaterial(index, 'sap_code', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      variant="standard"
                      placeholder="Descripción detallada..."
                      value={row.detail}
                      onChange={(e) => updateMaterial(index, 'detail', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      variant="standard"
                      placeholder="N° Reserva"
                      value={row.reserve}
                      onChange={(e) => updateMaterial(index, 'reserve', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Eliminar material">
                      <IconButton size="small" color="error" onClick={() => removeMaterial(index)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box>
      <Box mb={4}>
        {isEditingReport ? (
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <IconButton onClick={() => navigate('/reports')}><ArrowBack /></IconButton>
            <Typography variant="h4" fontWeight="800" color="primary">
              ✏️ Editar Reporte #{reportId?.slice(0, 4)}
            </Typography>
          </Box>
        ) : (
          <Typography variant="h4" fontWeight="800" color="primary">
            🔧 Mantenimiento Shelter - Skid
          </Typography>
        )}
        <Typography variant="body2" color="textSecondary">
          {isEditingReport ? 'Modifica los datos del reporte y guarda los cambios.' : 'Registro completo con pruebas estáticas, evidencia fotográfica y control de materiales'}
        </Typography>
      </Box>

      {!isEditingReport && (
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
                disabled={loading || saving || uploadingImage}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={buscarVFD}
                disabled={loading || saving || uploadingImage || !searchCode.trim()}
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
                disabled={loading || saving || uploadingImage}
                startIcon={<Refresh />}
                sx={{ height: 56 }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {vfdEncontrado && (
        <Card sx={{ borderRadius: 4, mb: 3, overflow: 'hidden' }}>
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
            <Typography variant="h6" fontWeight="700" gutterBottom>📋 Datos Generales del Mantenimiento</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="📅 Fecha de Inicio"
                  type="datetime-local"
                  value={maintenanceForm.fecha_inicio}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, fecha_inicio: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="📅 Fecha de Finalización"
                  type="datetime-local"
                  value={maintenanceForm.fecha_fin}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, fecha_fin: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="📍 Sitio del Mantenimiento"
                  value={maintenanceForm.sitio}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, sitio: e.target.value })}
                  placeholder="Ej: Planta Norte"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="🛢️ Pozo"
                  value={maintenanceForm.pozo}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, pozo: e.target.value })}
                  placeholder="Ej: Pozo-001"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="⚙️ Módulo de Producción"
                  value={maintenanceForm.modulo_produccion}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, modulo_produccion: e.target.value })}
                  placeholder="Ej: Módulo A"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="🔧 Taller / Área"
                  value={maintenanceForm.taller}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, taller: e.target.value })}
                  placeholder="Ej: Taller Eléctrico"
                />
              </Grid>
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
                  label="💲 Costo estimado ($)"
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
                  label="📍 Ubicación de la intervención"
                  value={maintenanceForm.observations}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, observations: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="📝 Descripción de la tarea principal"
                  value={maintenanceForm.descripcion}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, descripcion: e.target.value })}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {renderChecklistSection('Mantenimiento Preventivo Shelter – Skid', 'shelter_skid', checklist.shelter_skid)}
            {renderChecklistSection('Mantenimiento CBM en VSD', 'cbm_vsd', checklist.cbm_vsd)}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mt: 2 }}>⚡ Pruebas Estáticas del VSD</Typography>
            {renderStaticTestTable('Prueba Estática Conversor I', 'converter_1', checklist.static_tests.converter_1)}
            {renderStaticTestTable('Prueba Estática Inversora II', 'inverter_2', checklist.static_tests.inverter_2)}
            {renderStaticTestTable('Prueba Estática Conversor', 'converter_3', checklist.static_tests.converter_3)}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mt: 2 }}>📷 Registro Fotográfico</Typography>
            {renderPhotoSection('Antes del mantenimiento', 'before')}
            {renderPhotoSection('Después del mantenimiento', 'after')}

            <Divider sx={{ my: 3 }} />

            {renderMaterialsTable()}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mt: 2 }}>📝 Conclusiones del Mantenimiento</Typography>
            <TextField
              fullWidth
              size="small"
              label="Escribe aquí las conclusiones técnicas, resultados y observaciones finales..."
              value={maintenanceForm.conclusiones}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, conclusiones: e.target.value })}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />

            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                size="large"
                startIcon={<FilePresent />}
                onClick={guardarMantenimiento}
                disabled={saving || uploadingImage || !maintenanceForm.descripcion.trim()}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                {isEditingReport ? 'Actualizar Reporte' : 'Finalizar y Generar Reporte'}
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
