import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Chip,
  IconButton,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  CloudUpload as CloudUploadIcon,
  Assignment as AssignmentIcon,
  Checklist as ChecklistIcon,
  Science as ScienceIcon,
  Build as BuildIcon,
  Description as DescriptionIcon,
  Conclusion as ConclusionIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useVSD } from '../../context/VSDContext';
import { toast } from 'react-toastify';

const tipos = [
  { value: 'preventivo', label: '🛠️ Preventivo' },
  { value: 'correctivo', label: '🔧 Correctivo' },
  { value: 'predictivo', label: '📊 Predictivo' }
];

const estados = [
  { value: 'pendiente', label: 'Pendiente', color: 'warning' },
  { value: 'en_progreso', label: 'En Progreso', color: 'info' },
  { value: 'completado', label: 'Completado', color: 'success' },
  { value: 'cancelado', label: 'Cancelado', color: 'error' }
];

const prioridades = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' }
];

// Actividades de chequeo predefinidas
const actividadesChequeo = [
  { id: 1, categoria: 'Shelter - Skid', actividad: 'Limpieza interior y exterior (Piso, puertas, gabinetes)' },
  { id: 2, categoria: 'Shelter - Skid', actividad: 'Aspirado y soplado de polvo' },
  { id: 3, categoria: 'Shelter - Skid', actividad: 'Ajuste de conexiones de Gabinetes de potencia y VSD' },
  { id: 4, categoria: 'Shelter - Skid', actividad: 'Revisión y ajuste de conexiones' },
  { id: 5, categoria: 'Shelter - Skid', actividad: 'Verificación de iluminación interna y externa' },
  { id: 6, categoria: 'Shelter - Skid', actividad: 'Verificación de subsistema de refrigeración' },
  { id: 7, categoria: 'Shelter - Skid', actividad: 'Verificación y ajuste de Bandejas porta cables' },
  { id: 8, categoria: 'Shelter - Skid', actividad: 'Verificación estado de ventiladores' },
  { id: 9, categoria: 'Shelter - Skid', actividad: 'Revisión de protecciones' },
  { id: 10, categoria: 'Shelter - Skid', actividad: 'Comprobación de la correcta operación de los equipos' },
  { id: 11, categoria: 'CBM en VSD', actividad: 'Predictivo de Termografía en SCP, ESD, SCA, CSA, VSD' },
  { id: 12, categoria: 'CBM en VSD', actividad: 'Predictivo de Calidad de Energía en cada Pozo' },
  { id: 13, categoria: 'CBM en VSD', actividad: 'Predictivo de Mediciones Eléctricas' }
];

const MaintenanceForm = ({ open, onClose, maintenanceToEdit, isEditing, vsdId }) => {
  const { createMaintenance, updateMaintenance, vsds } = useVSD();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    vsdId: vsdId || '',
    tipo: 'preventivo',
    titulo: '',
    descripcion: '',
    fechaProgramada: '',
    fechaEjecucion: '',
    prioridad: 'media',
    estado: 'pendiente',
    tecnico: '',
    costo: 0,
    duracion: 0,
    observaciones: '',
    
    // Nuevos campos
    compania: 'INEMEC S.A.S',
    cliente: '',
    locacion: '',
    pozo: '',
    area: '',
    proceso: '',
    serviceTicket: '',
    objetivoGeneral: '',
    
    equipos: {
      vsd: { marca: '', modelo: '', serie: '', kva: '', amps: '' },
      sut: { marca: '', modelo: '', serie: '', kva: '', amps: '' }
    },
    
    listaChequeo: actividadesChequeo.map(a => ({
      ...a,
      hecho: false,
      observacion: ''
    })),
    
    actividadesRealizadas: '',
    
    pruebasEstaticas: {
      conversor: [
        { medicion: 'DC BUS + / Entrada R', esperado: '0.2 - 0.6', actual: '' },
        { medicion: 'DC BUS + / Entrada S', esperado: '0.2 - 0.6', actual: '' },
        { medicion: 'DC BUS + / Entrada T', esperado: '0.2 - 0.6', actual: '' },
        { medicion: 'DC BUS - / Entrada R', esperado: '0.2 - 0.6', actual: '' },
        { medicion: 'DC BUS - / Entrada S', esperado: '0.2 - 0.6', actual: '' },
        { medicion: 'DC BUS - / Entrada T', esperado: '0.2 - 0.6', actual: '' }
      ],
      inversor: [
        { medicion: 'DC BUS + / Entrada R', esperado: '0.2 - 0.6', actual: '' },
        { medicion: 'DC BUS + / Entrada S', esperado: '0.2 - 0.6', actual: '' },
        { medicion: 'DC BUS + / Entrada T', esperado: '0.2 - 0.6', actual: '' },
        { medicion: 'DC BUS - / Entrada R', esperado: '0.2 - 0.6', actual: '' },
        { medicion: 'DC BUS - / Entrada S', esperado: '0.2 - 0.6', actual: '' },
        { medicion: 'DC BUS - / Entrada T', esperado: '0.2 - 0.6', actual: '' }
      ]
    },
    
    evidencias: [],
    accesoriosCambiados: [
      { cantidad: 1, codigoSap: '', detalle: '', reserva: '' }  // CAMBIO: "reserva" en lugar de "total"
    ],
    conclusiones: '',
    recomendaciones: '',
    firmaTecnico: {
      nombre: '',
      cargo: 'Field Specialist',
      telefono: '',
      correo: '',
      fecha: new Date().toISOString().split('T')[0]
    }
  });

  useEffect(() => {
    if (maintenanceToEdit && isEditing) {
      const m = maintenanceToEdit;
      setFormData({
        vsdId: m.vsdId || '',
        tipo: m.tipo || 'preventivo',
        titulo: m.titulo || '',
        descripcion: m.descripcion || '',
        fechaProgramada: m.fechaProgramada ? new Date(m.fechaProgramada).toISOString().split('T')[0] : '',
        fechaEjecucion: m.fechaEjecucion ? new Date(m.fechaEjecucion).toISOString().split('T')[0] : '',
        prioridad: m.prioridad || 'media',
        estado: m.estado || 'pendiente',
        tecnico: m.tecnico || '',
        costo: m.costo || 0,
        duracion: m.duracion || 0,
        observaciones: m.observaciones || '',
        compania: m.compania || 'INEMEC S.A.S',
        cliente: m.cliente || '',
        locacion: m.locacion || '',
        pozo: m.pozo || '',
        area: m.area || '',
        proceso: m.proceso || '',
        serviceTicket: m.serviceTicket || '',
        objetivoGeneral: m.objetivoGeneral || '',
        equipos: m.equipos || { vsd: { marca: '', modelo: '', serie: '', kva: '', amps: '' }, sut: { marca: '', modelo: '', serie: '', kva: '', amps: '' } },
        listaChequeo: m.listaChequeo || actividadesChequeo.map(a => ({ ...a, hecho: false, observacion: '' })),
        actividadesRealizadas: m.actividadesRealizadas || '',
        pruebasEstaticas: m.pruebasEstaticas || {
          conversor: [
            { medicion: 'DC BUS + / Entrada R', esperado: '0.2 - 0.6', actual: '' },
            { medicion: 'DC BUS + / Entrada S', esperado: '0.2 - 0.6', actual: '' },
            { medicion: 'DC BUS + / Entrada T', esperado: '0.2 - 0.6', actual: '' },
            { medicion: 'DC BUS - / Entrada R', esperado: '0.2 - 0.6', actual: '' },
            { medicion: 'DC BUS - / Entrada S', esperado: '0.2 - 0.6', actual: '' },
            { medicion: 'DC BUS - / Entrada T', esperado: '0.2 - 0.6', actual: '' }
          ],
          inversor: [
            { medicion: 'DC BUS + / Entrada R', esperado: '0.2 - 0.6', actual: '' },
            { medicion: 'DC BUS + / Entrada S', esperado: '0.2 - 0.6', actual: '' },
            { medicion: 'DC BUS + / Entrada T', esperado: '0.2 - 0.6', actual: '' },
            { medicion: 'DC BUS - / Entrada R', esperado: '0.2 - 0.6', actual: '' },
            { medicion: 'DC BUS - / Entrada S', esperado: '0.2 - 0.6', actual: '' },
            { medicion: 'DC BUS - / Entrada T', esperado: '0.2 - 0.6', actual: '' }
          ]
        },
        evidencias: m.evidencias || [],
        accesoriosCambiados: m.accesoriosCambiados || [{ cantidad: 1, codigoSap: '', detalle: '', reserva: '' }],
        conclusiones: m.conclusiones || '',
        recomendaciones: m.recomendaciones || '',
        firmaTecnico: m.firmaTecnico || {
          nombre: '',
          cargo: 'Field Specialist',
          telefono: '',
          correo: '',
          fecha: new Date().toISOString().split('T')[0]
        }
      });
    } else if (vsdId) {
      setFormData(prev => ({ ...prev, vsdId }));
    }
  }, [maintenanceToEdit, isEditing, vsdId, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleEquipoChange = (tipo, campo, value) => {
    setFormData(prev => ({
      ...prev,
      equipos: {
        ...prev.equipos,
        [tipo]: {
          ...prev.equipos[tipo],
          [campo]: value
        }
      }
    }));
  };

  const handleChequeoChange = (index, campo, value) => {
    const newLista = [...formData.listaChequeo];
    newLista[index] = { ...newLista[index], [campo]: value };
    setFormData(prev => ({ ...prev, listaChequeo: newLista }));
  };

  const handlePruebaChange = (tipo, index, campo, value) => {
    const newPruebas = { ...formData.pruebasEstaticas };
    newPruebas[tipo][index] = { ...newPruebas[tipo][index], [campo]: value };
    setFormData(prev => ({ ...prev, pruebasEstaticas: newPruebas }));
  };

  // ============ ACCESORIOS CAMBIADOS ============
  const handleAccesorioChange = (index, campo, value) => {
    const newAccesorios = [...formData.accesoriosCambiados];
    newAccesorios[index] = { ...newAccesorios[index], [campo]: value };
    setFormData(prev => ({ ...prev, accesoriosCambiados: newAccesorios }));
  };

  const addAccesorio = () => {
    setFormData(prev => ({
      ...prev,
      accesoriosCambiados: [...prev.accesoriosCambiados, { cantidad: 1, codigoSap: '', detalle: '', reserva: '' }]
    }));
  };

  const removeAccesorio = (index) => {
    if (formData.accesoriosCambiados.length > 1) {
      setFormData(prev => ({
        ...prev,
        accesoriosCambiados: prev.accesoriosCambiados.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFirmaChange = (campo, value) => {
    setFormData(prev => ({
      ...prev,
      firmaTecnico: {
        ...prev.firmaTecnico,
        [campo]: value
      }
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.vsdId) newErrors.vsdId = 'El VSD es requerido';
    if (!formData.titulo.trim()) newErrors.titulo = 'El título es requerido';
    if (!formData.tipo) newErrors.tipo = 'El tipo es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        fechaProgramada: formData.fechaProgramada || null,
        fechaEjecucion: formData.fechaEjecucion || null,
        costo: parseFloat(formData.costo) || 0,
        duracion: parseFloat(formData.duracion) || 0
      };

      if (isEditing && maintenanceToEdit) {
        await updateMaintenance(maintenanceToEdit._id, dataToSave);
      } else {
        await createMaintenance(dataToSave);
      }
      resetForm();
      onClose();
    } catch (error) {
      // Error ya manejado en el contexto
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vsdId: vsdId || '',
      tipo: 'preventivo',
      titulo: '',
      descripcion: '',
      fechaProgramada: '',
      fechaEjecucion: '',
      prioridad: 'media',
      estado: 'pendiente',
      tecnico: '',
      costo: 0,
      duracion: 0,
      observaciones: '',
      compania: 'INEMEC S.A.S',
      cliente: '',
      locacion: '',
      pozo: '',
      area: '',
      proceso: '',
      serviceTicket: '',
      objetivoGeneral: '',
      equipos: {
        vsd: { marca: '', modelo: '', serie: '', kva: '', amps: '' },
        sut: { marca: '', modelo: '', serie: '', kva: '', amps: '' }
      },
      listaChequeo: actividadesChequeo.map(a => ({ ...a, hecho: false, observacion: '' })),
      actividadesRealizadas: '',
      pruebasEstaticas: {
        conversor: [
          { medicion: 'DC BUS + / Entrada R', esperado: '0.2 - 0.6', actual: '' },
          { medicion: 'DC BUS + / Entrada S', esperado: '0.2 - 0.6', actual: '' },
          { medicion: 'DC BUS + / Entrada T', esperado: '0.2 - 0.6', actual: '' },
          { medicion: 'DC BUS - / Entrada R', esperado: '0.2 - 0.6', actual: '' },
          { medicion: 'DC BUS - / Entrada S', esperado: '0.2 - 0.6', actual: '' },
          { medicion: 'DC BUS - / Entrada T', esperado: '0.2 - 0.6', actual: '' }
        ],
        inversor: [
          { medicion: 'DC BUS + / Entrada R', esperado: '0.2 - 0.6', actual: '' },
          { medicion: 'DC BUS + / Entrada S', esperado: '0.2 - 0.6', actual: '' },
          { medicion: 'DC BUS + / Entrada T', esperado: '0.2 - 0.6', actual: '' },
          { medicion: 'DC BUS - / Entrada R', esperado: '0.2 - 0.6', actual: '' },
          { medicion: 'DC BUS - / Entrada S', esperado: '0.2 - 0.6', actual: '' },
          { medicion: 'DC BUS - / Entrada T', esperado: '0.2 - 0.6', actual: '' }
        ]
      },
      evidencias: [],
      accesoriosCambiados: [{ cantidad: 1, codigoSap: '', detalle: '', reserva: '' }],
      conclusiones: '',
      recomendaciones: '',
      firmaTecnico: {
        nombre: '',
        cargo: 'Field Specialist',
        telefono: '',
        correo: '',
        fecha: new Date().toISOString().split('T')[0]
      }
    });
    setErrors({});
    setActiveTab(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Tabs
  const tabs = [
    { label: '📋 General', icon: <AssignmentIcon /> },
    { label: '✅ Chequeo', icon: <ChecklistIcon /> },
    { label: '🔬 Pruebas', icon: <ScienceIcon /> },
    { label: '⚙️ Equipos', icon: <BuildIcon /> },
    { label: '📄 Detalles', icon: <DescriptionIcon /> },
    { label: '✍️ Firma', icon: <PersonIcon /> }
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {isEditing ? '✏️ Editar Mantenimiento' : '📋 Nuevo Mantenimiento'}
          </Typography>
          <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 0 }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 1 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
              {tabs.map((tab, index) => (
                <Tab key={index} label={tab.label} icon={tab.icon} iconPosition="start" />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ p: 3, maxHeight: 'calc(90vh - 180px)', overflow: 'auto' }}>
            
            {/* ====== TAB 0: GENERAL ====== */}
            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                    📋 Información General
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.vsdId}>
                    <InputLabel>VSD *</InputLabel>
                    <Select
                      name="vsdId"
                      value={formData.vsdId}
                      onChange={handleChange}
                      label="VSD *"
                      disabled={loading || !!vsdId}
                    >
                      {vsds.map((v) => (
                        <MenuItem key={v._id} value={v._id}>
                          {v.nombre} - {v.serie}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.vsdId && <Typography variant="caption" color="error">{errors.vsdId}</Typography>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Título *"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    error={!!errors.titulo}
                    helperText={errors.titulo}
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo *</InputLabel>
                    <Select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      label="Tipo *"
                      disabled={loading}
                    >
                      {tipos.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      label="Estado"
                      disabled={loading}
                    >
                      {estados.map((e) => <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Fecha Programada"
                    name="fechaProgramada"
                    type="date"
                    value={formData.fechaProgramada}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Fecha Ejecución"
                    name="fechaEjecucion"
                    type="date"
                    value={formData.fechaEjecucion}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Prioridad</InputLabel>
                    <Select
                      name="prioridad"
                      value={formData.prioridad}
                      onChange={handleChange}
                      label="Prioridad"
                      disabled={loading}
                    >
                      {prioridades.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Técnico"
                    name="tecnico"
                    value={formData.tecnico}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Costo ($)"
                    name="costo"
                    type="number"
                    value={formData.costo}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Duración (horas)"
                    name="duracion"
                    type="number"
                    value={formData.duracion}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                    🏢 Datos de Ubicación
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Compañía"
                    name="compania"
                    value={formData.compania}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cliente"
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Locación"
                    name="locacion"
                    value={formData.locacion}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Pozo"
                    name="pozo"
                    value={formData.pozo}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Service Ticket"
                    name="serviceTicket"
                    value={formData.serviceTicket}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Área"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Proceso"
                    name="proceso"
                    value={formData.proceso}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                    🎯 Objetivo General
                  </Typography>
                  <TextField
                    fullWidth
                    label="Objetivo General"
                    name="objetivoGeneral"
                    value={formData.objetivoGeneral}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="Aumentar la confiabilidad, extender el ciclo de vida de los equipos..."
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            )}

            {/* ====== TAB 1: CHEQUEO ====== */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                  ✅ Lista de Chequeo
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                  Marque con una X las actividades realizadas
                </Typography>
                
                {formData.listaChequeo.map((item, index) => (
                  <Paper key={item.id} sx={{ p: 2, mb: 2, bgcolor: '#f8fafc' }}>
                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                      <Chip label={item.categoria} size="small" color="primary" />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {item.actividad}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item.hecho}
                            onChange={(e) => handleChequeoChange(index, 'hecho', e.target.checked)}
                            disabled={loading}
                            color="success"
                          />
                        }
                        label="Hecho"
                      />
                      <TextField
                        label="Observación"
                        size="small"
                        value={item.observacion || ''}
                        onChange={(e) => handleChequeoChange(index, 'observacion', e.target.value)}
                        disabled={loading}
                        sx={{ minWidth: 150 }}
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}

            {/* ====== TAB 2: PRUEBAS ESTÁTICAS ====== */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                  🔬 Pruebas Estáticas
                </Typography>
                
                {/* Conversor */}
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2 }}>
                  Conversor
                </Typography>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={4}><Typography variant="caption" fontWeight="bold">Medición</Typography></Grid>
                  <Grid item xs={4}><Typography variant="caption" fontWeight="bold">Esperado</Typography></Grid>
                  <Grid item xs={4}><Typography variant="caption" fontWeight="bold">Actual</Typography></Grid>
                  {formData.pruebasEstaticas.conversor.map((item, index) => (
                    <React.Fragment key={index}>
                      <Grid item xs={4}>
                        <Typography variant="caption">{item.medicion}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption">{item.esperado}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          size="small"
                          value={item.actual}
                          onChange={(e) => handlePruebaChange('conversor', index, 'actual', e.target.value)}
                          disabled={loading}
                          fullWidth
                          placeholder="Valor"
                        />
                      </Grid>
                    </React.Fragment>
                  ))}
                </Grid>

                {/* Inversor */}
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2 }}>
                  Inversor
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}><Typography variant="caption" fontWeight="bold">Medición</Typography></Grid>
                  <Grid item xs={4}><Typography variant="caption" fontWeight="bold">Esperado</Typography></Grid>
                  <Grid item xs={4}><Typography variant="caption" fontWeight="bold">Actual</Typography></Grid>
                  {formData.pruebasEstaticas.inversor.map((item, index) => (
                    <React.Fragment key={index}>
                      <Grid item xs={4}>
                        <Typography variant="caption">{item.medicion}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption">{item.esperado}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          size="small"
                          value={item.actual}
                          onChange={(e) => handlePruebaChange('inversor', index, 'actual', e.target.value)}
                          disabled={loading}
                          fullWidth
                          placeholder="Valor"
                        />
                      </Grid>
                    </React.Fragment>
                  ))}
                </Grid>
              </Box>
            )}

            {/* ====== TAB 3: EQUIPOS ====== */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                  ⚙️ Equipos de Superficie
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: '#f8fafc' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                        VSD
                      </Typography>
                      <TextField
                        fullWidth
                        label="Marca"
                        size="small"
                        value={formData.equipos.vsd.marca}
                        onChange={(e) => handleEquipoChange('vsd', 'marca', e.target.value)}
                        disabled={loading}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        label="Modelo"
                        size="small"
                        value={formData.equipos.vsd.modelo}
                        onChange={(e) => handleEquipoChange('vsd', 'modelo', e.target.value)}
                        disabled={loading}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        label="Serie"
                        size="small"
                        value={formData.equipos.vsd.serie}
                        onChange={(e) => handleEquipoChange('vsd', 'serie', e.target.value)}
                        disabled={loading}
                        sx={{ mb: 1 }}
                      />
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="KVA"
                            size="small"
                            value={formData.equipos.vsd.kva}
                            onChange={(e) => handleEquipoChange('vsd', 'kva', e.target.value)}
                            disabled={loading}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="AMPS"
                            size="small"
                            value={formData.equipos.vsd.amps}
                            onChange={(e) => handleEquipoChange('vsd', 'amps', e.target.value)}
                            disabled={loading}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: '#f8fafc' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                        SUT (Transformador)
                      </Typography>
                      <TextField
                        fullWidth
                        label="Marca"
                        size="small"
                        value={formData.equipos.sut.marca}
                        onChange={(e) => handleEquipoChange('sut', 'marca', e.target.value)}
                        disabled={loading}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        label="Modelo"
                        size="small"
                        value={formData.equipos.sut.modelo}
                        onChange={(e) => handleEquipoChange('sut', 'modelo', e.target.value)}
                        disabled={loading}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        label="Serie"
                        size="small"
                        value={formData.equipos.sut.serie}
                        onChange={(e) => handleEquipoChange('sut', 'serie', e.target.value)}
                        disabled={loading}
                        sx={{ mb: 1 }}
                      />
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="KVA"
                            size="small"
                            value={formData.equipos.sut.kva}
                            onChange={(e) => handleEquipoChange('sut', 'kva', e.target.value)}
                            disabled={loading}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="AMPS"
                            size="small"
                            value={formData.equipos.sut.amps}
                            onChange={(e) => handleEquipoChange('sut', 'amps', e.target.value)}
                            disabled={loading}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ====== TAB 4: DETALLES ====== */}
            {activeTab === 4 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                  📝 Actividades Realizadas
                </Typography>
                <TextField
                  fullWidth
                  label="Descripción detallada de actividades"
                  name="actividadesRealizadas"
                  value={formData.actividadesRealizadas}
                  onChange={handleChange}
                  multiline
                  rows={6}
                  placeholder="Ej: • Limpieza a la parte interna y externa del gabinete... • Verificación de conexiones..."
                  disabled={loading}
                  sx={{ mb: 3 }}
                />

                <Divider sx={{ my: 2 }} />

                {/* ============ ACCESORIOS CAMBIADOS ============ */}
                <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                  🔧 Accesorios Cambiados
                </Typography>
                {formData.accesoriosCambiados.map((item, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: '#f8fafc' }}>
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <TextField
                        label="Cant"
                        type="number"
                        size="small"
                        value={item.cantidad}
                        onChange={(e) => handleAccesorioChange(index, 'cantidad', parseInt(e.target.value) || 0)}
                        disabled={loading}
                        sx={{ width: 60 }}
                      />
                      <TextField
                        label="Código SAP"
                        size="small"
                        value={item.codigoSap}
                        onChange={(e) => handleAccesorioChange(index, 'codigoSap', e.target.value)}
                        disabled={loading}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Detalle"
                        size="small"
                        value={item.detalle}
                        onChange={(e) => handleAccesorioChange(index, 'detalle', e.target.value)}
                        disabled={loading}
                        sx={{ flex: 2 }}
                      />
                      <TextField
                        label="Reserva"  // CAMBIO: "Total" → "Reserva"
                        size="small"
                        value={item.reserva || ''}
                        onChange={(e) => handleAccesorioChange(index, 'reserva', e.target.value)}
                        disabled={loading}
                        sx={{ width: 100 }}
                        placeholder="Código alfanumérico"
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeAccesorio(index)}
                        disabled={loading || formData.accesoriosCambiados.length <= 1}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addAccesorio}
                  disabled={loading}
                >
                  Agregar accesorio
                </Button>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                  📋 Conclusiones y Recomendaciones
                </Typography>
                <TextField
                  fullWidth
                  label="Conclusiones"
                  name="conclusiones"
                  value={formData.conclusiones}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Conclusiones del mantenimiento..."
                  disabled={loading}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Recomendaciones"
                  name="recomendaciones"
                  value={formData.recomendaciones}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Recomendaciones para futuros mantenimientos..."
                  disabled={loading}
                />
              </Box>
            )}

            {/* ====== TAB 5: FIRMA ====== */}
            {activeTab === 5 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                  ✍️ Firma del Técnico
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre Completo"
                      value={formData.firmaTecnico.nombre}
                      onChange={(e) => handleFirmaChange('nombre', e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Cargo"
                      value={formData.firmaTecnico.cargo}
                      onChange={(e) => handleFirmaChange('cargo', e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={formData.firmaTecnico.telefono}
                      onChange={(e) => handleFirmaChange('telefono', e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Correo"
                      value={formData.firmaTecnico.correo}
                      onChange={(e) => handleFirmaChange('correo', e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Fecha"
                      type="date"
                      value={formData.firmaTecnico.fecha}
                      onChange={(e) => handleFirmaChange('fecha', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      disabled={loading}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #ccc' }}>
                  <Typography variant="caption" color="textSecondary">
                    Área de Firma (Espacio para imagen o firma digital)
                  </Typography>
                  <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', borderRadius: 1, mt: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      Firma del Técnico
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MaintenanceForm;