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
  InputAdornment,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, Add as AddIcon } from '@mui/icons-material';
import { useVSD } from '../../context/VSDContext';
import { toast } from 'react-toastify';

const estados = [
  { value: 'activo', label: 'Activo', color: 'success' },
  { value: 'mantenimiento', label: 'En Mantenimiento', color: 'warning' },
  { value: 'inactivo', label: 'Inactivo', color: 'error' }
];

const marcasPredefinidas = [
  'Siemens', 'ABB', 'Danfoss', 'Schneider Electric', 
  'Allen-Bradley', 'Mitsubishi', 'Yaskawa', 'Otro'
];

const VSDForm = ({ open, onClose, vsdToEdit, isEditing }) => {
  const { createVSD, updateVSD } = useVSD();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [marcas, setMarcas] = useState(marcasPredefinidas);
  const [marcaInput, setMarcaInput] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    serie: '',
    ubicacion: '',
    marca: '',
    modelo: '',
    potencia: '',
    voltage: '',
    corriente: '',
    frecuencia: '',
    fechaInstalacion: '',
    estado: 'activo',
    notas: '',
    horasOperacion: 0
  });

  useEffect(() => {
    const savedMarcas = localStorage.getItem('vsd_marcas');
    if (savedMarcas) {
      try {
        const parsed = JSON.parse(savedMarcas);
        setMarcas([...marcasPredefinidas, ...parsed]);
      } catch (e) {
        console.error('Error cargando marcas:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (vsdToEdit && isEditing) {
      setFormData({
        nombre: vsdToEdit.nombre || '',
        serie: vsdToEdit.serie || '',
        ubicacion: vsdToEdit.ubicacion || '',
        marca: vsdToEdit.marca || '',
        modelo: vsdToEdit.modelo || '',
        potencia: vsdToEdit.potencia || '',
        voltage: vsdToEdit.voltage || '',
        corriente: vsdToEdit.corriente || '',
        frecuencia: vsdToEdit.frecuencia || '',
        fechaInstalacion: vsdToEdit.fechaInstalacion ? new Date(vsdToEdit.fechaInstalacion).toISOString().split('T')[0] : '',
        estado: vsdToEdit.estado || 'activo',
        notas: vsdToEdit.notas || '',
        horasOperacion: vsdToEdit.horasOperacion || 0
      });
    } else {
      resetForm();
    }
  }, [vsdToEdit, isEditing, open]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      serie: '',
      ubicacion: '',
      marca: '',
      modelo: '',
      potencia: '',
      voltage: '',
      corriente: '',
      frecuencia: '',
      fechaInstalacion: '',
      estado: 'activo',
      notas: '',
      horasOperacion: 0
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddMarca = (nuevaMarca) => {
    if (!nuevaMarca || nuevaMarca.trim() === '') return;
    if (marcas.includes(nuevaMarca.trim())) {
      toast.info('⚠️ Esta marca ya existe');
      return;
    }
    
    const updatedMarcas = [...marcas, nuevaMarca.trim()];
    setMarcas(updatedMarcas);
    setFormData(prev => ({ ...prev, marca: nuevaMarca.trim() }));
    setMarcaInput('');
    
    const customMarcas = updatedMarcas.filter(m => !marcasPredefinidas.includes(m));
    localStorage.setItem('vsd_marcas', JSON.stringify(customMarcas));
    toast.success('✅ Nueva marca agregada');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.serie.trim()) newErrors.serie = 'El número de serie es requerido';
    if (!formData.marca) newErrors.marca = 'La marca es requerida';
    if (!formData.ubicacion.trim()) newErrors.ubicacion = 'La ubicación es requerida';
    if (!formData.modelo.trim()) newErrors.modelo = 'El modelo es requerido';
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
        fechaInstalacion: formData.fechaInstalacion || null,
        horasOperacion: parseFloat(formData.horasOperacion) || 0
      };

      if (isEditing && vsdToEdit) {
        await updateVSD(vsdToEdit._id, dataToSave);
      } else {
        await createVSD(dataToSave);
      }
      resetForm();
      onClose();
    } catch (error) {
      // Error ya manejado en el contexto
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {isEditing ? '✏️ Editar VSD' : '➕ Nuevo VSD'}
          </Typography>
          <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del VSD *"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número de Serie *"
                name="serie"
                value={formData.serie}
                onChange={handleChange}
                error={!!errors.serie}
                helperText={errors.serie}
                required
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={marcas}
                value={formData.marca}
                onInputChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, marca: newValue || '' }));
                  setMarcaInput(newValue || '');
                }}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, marca: newValue || '' }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Marca *"
                    required
                    error={!!errors.marca}
                    helperText={errors.marca}
                    disabled={loading}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          <IconButton 
                            size="small" 
                            onClick={() => handleAddMarca(marcaInput)}
                            disabled={!marcaInput || loading}
                            title="Agregar nueva marca"
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </>
                      )
                    }}
                  />
                )}
              />
              <Typography variant="caption" color="textSecondary">
                💡 Escribe una nueva marca y haz clic en el botón + para agregarla
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Modelo *"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                error={!!errors.modelo}
                helperText={errors.modelo}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ubicación *"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                error={!!errors.ubicacion}
                helperText={errors.ubicacion}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Especificaciones Técnicas
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Potencia (kW/HP)"
                name="potencia"
                value={formData.potencia}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start">⚡</InputAdornment> }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Voltaje (V)"
                name="voltage"
                value={formData.voltage}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start">⚡</InputAdornment> }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Corriente (A)"
                name="corriente"
                value={formData.corriente}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start">🔌</InputAdornment> }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Frecuencia (Hz)"
                name="frecuencia"
                value={formData.frecuencia}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Horas de Operación"
                name="horasOperacion"
                type="number"
                value={formData.horasOperacion}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha de Instalación"
                name="fechaInstalacion"
                type="date"
                value={formData.fechaInstalacion}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                disabled={loading}
              >
                {estados.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    <Chip label={estado.label} size="small" color={estado.color} />
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas / Observaciones"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                multiline
                rows={3}
                disabled={loading}
              />
            </Grid>
          </Grid>
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

export default VSDForm;