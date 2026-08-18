import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions,
  Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, IconButton, Chip,
  InputAdornment, Divider, useMediaQuery, useTheme,
  MenuItem, Select, FormControl, InputLabel, Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Speed as SpeedIcon,
  LocationOn as LocationOnIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { getVSDs, createVSD, updateVSD, deleteVSD, generarCodigoVSD } from '../services/vsdService';
import { useAuth } from '../context/AuthContext';
import VSDDetail from '../components/VSDDetail';
import ImageUpload from '../components/ImageUpload';

const VSDs = () => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isViewer = !isAuthenticated;
  
  const [vsds, setVsds] = useState([]);
  const [filteredVsds, setFilteredVsds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('todo');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVSD, setEditingVSD] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tempImages, setTempImages] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedVSD, setSelectedVSD] = useState(null);
  const [formData, setFormData] = useState({
    codigo_vsd: '',
    manufacturer: '',
    model: '',
    status: 'activo',
    health_score: '',
    serial_number: '',
    voltage_rating: '',
    kva: '',
    site: '',
    plant: '',
    department: '',
    observations: '',
    image_url_1: '',
    image_name_1: '',
    image_id_1: '',
    image_url_2: '',
    image_name_2: '',
    image_id_2: '',
    image_url_3: '',
    image_name_3: '',
    image_id_3: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  // Búsqueda avanzada - NUEVA FUNCIONALIDAD
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      let filtered = vsds.filter(vsd => {
        switch(searchType) {
          case 'codigo':
            return vsd.codigo_vsd?.toLowerCase().includes(term);
          case 'fabricante':
            return vsd.manufacturer?.toLowerCase().includes(term);
          case 'serie':
            return vsd.serial_number?.toLowerCase().includes(term);
          case 'kva':
            return vsd.kva?.toLowerCase().includes(term);
          case 'todo':
          default:
            return vsd.codigo_vsd?.toLowerCase().includes(term) ||
                   vsd.manufacturer?.toLowerCase().includes(term) ||
                   vsd.model?.toLowerCase().includes(term) ||
                   vsd.serial_number?.toLowerCase().includes(term) ||
                   vsd.kva?.toLowerCase().includes(term);
        }
      });
      setFilteredVsds(filtered);
    } else {
      setFilteredVsds(vsds);
    }
  }, [searchTerm, searchType, vsds]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getVSDs();
      setVsds(data || []);
      setFilteredVsds(data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los VSDs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (vsd = null) => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para editar');
      return;
    }
    
    if (vsd) {
      setEditingVSD(vsd);
      setFormData({
        codigo_vsd: vsd.codigo_vsd || '',
        manufacturer: vsd.manufacturer || '',
        model: vsd.model || '',
        status: vsd.status || 'activo',
        health_score: vsd.health_score || '',
        serial_number: vsd.serial_number || '',
        voltage_rating: vsd.voltage_rating || '',
        kva: vsd.kva || '',
        site: vsd.site || '',
        plant: vsd.plant || '',
        department: vsd.department || '',
        observations: vsd.observations || '',
        image_url_1: vsd.image_url_1 || '',
        image_name_1: vsd.image_name_1 || '',
        image_id_1: vsd.image_id_1 || '',
        image_url_2: vsd.image_url_2 || '',
        image_name_2: vsd.image_name_2 || '',
        image_id_2: vsd.image_id_2 || '',
        image_url_3: vsd.image_url_3 || '',
        image_name_3: vsd.image_name_3 || '',
        image_id_3: vsd.image_id_3 || ''
      });
      const images = [];
      if (vsd.image_url_1) images.push(vsd.image_url_1);
      if (vsd.image_url_2) images.push(vsd.image_url_2);
      if (vsd.image_url_3) images.push(vsd.image_url_3);
      setTempImages(images);
    } else {
      setEditingVSD(null);
      generarCodigoVSD().then(newCode => {
        setFormData(prev => ({ ...prev, codigo_vsd: newCode }));
      });
      setFormData({
        codigo_vsd: '',
        manufacturer: '',
        model: '',
        status: 'activo',
        health_score: '',
        serial_number: '',
        voltage_rating: '',
        kva: '',
        site: '',
        plant: '',
        department: '',
        observations: '',
        image_url_1: '',
        image_name_1: '',
        image_id_1: '',
        image_url_2: '',
        image_name_2: '',
        image_id_2: '',
        image_url_3: '',
        image_name_3: '',
        image_id_3: ''
      });
      setTempImages([]);
    }
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVSD(null);
    setError('');
    setSuccess('');
    setTempImages([]);
  };

  const handleViewDetails = (vsd) => {
    setSelectedVSD(vsd);
    setDetailOpen(true);
  };

  const handleImageUpload = (file) => {
    if (!isAuthenticated) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result;
      const index = tempImages.length;
      if (index < 3) {
        const fieldUrl = `image_url_${index + 1}`;
        const fieldName = `image_name_${index + 1}`;
        setFormData(prev => ({ 
          ...prev, 
          [fieldUrl]: url,
          [fieldName]: file.name
        }));
        setTempImages(prev => [...prev, url]);
      } else {
        setError('Solo puedes agregar hasta 3 imágenes');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = (index) => {
    if (!isAuthenticated) return;
    const fieldUrl = `image_url_${index + 1}`;
    const fieldName = `image_name_${index + 1}`;
    const fieldId = `image_id_${index + 1}`;
    setFormData(prev => ({ 
      ...prev, 
      [fieldUrl]: '',
      [fieldName]: '',
      [fieldId]: ''
    }));
    setTempImages(prev => prev.filter((_, i) => i !== index));
    
    const remaining = tempImages.filter((_, i) => i !== index);
    const newFormData = { 
      ...formData, 
      image_url_1: '', image_name_1: '', image_id_1: '',
      image_url_2: '', image_name_2: '', image_id_2: '',
      image_url_3: '', image_name_3: '', image_id_3: ''
    };
    remaining.forEach((img, i) => {
      newFormData[`image_url_${i + 1}`] = img;
    });
    setFormData(newFormData);
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para guardar');
      return;
    }
    if (!formData.codigo_vsd) {
      setError('El código es obligatorio');
      return;
    }

    try {
      if (editingVSD) {
        await updateVSD(editingVSD.id, formData);
        setSuccess('VSD actualizado correctamente');
      } else {
        await createVSD(formData);
        setSuccess('VSD creado correctamente');
      }
      setTimeout(() => {
        handleCloseDialog();
        loadData();
      }, 1000);
    } catch (error) {
      setError('Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para eliminar');
      return;
    }
    if (window.confirm('¿Estás seguro de eliminar este VSD?')) {
      try {
        await deleteVSD(id);
        setSuccess('VSD eliminado correctamente');
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Error al eliminar');
      }
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchType('todo');
    setFilteredVsds(vsds);
  };

  const getStatusColor = (status) => {
    const colors = {
      'activo': '#22c55e',
      'mantenimiento': '#eab308',
      'critico': '#ef4444',
      'inactivo': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'activo': '✅ Activo',
      'mantenimiento': '🔧 Mantenimiento',
      'critico': '🚨 Crítico',
      'inactivo': '⏸️ Inactivo'
    };
    return labels[status] || status || 'Desconocido';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
            VSDs
          </Typography>
          {isViewer && (
            <Chip 
              label="🔍 Solo Lectura" 
              size="small" 
              sx={{ bgcolor: '#eab308', color: '#fff', fontWeight: 'bold' }}
            />
          )}
          <Chip 
            label={`${filteredVsds.length} encontrados`} 
            size="small" 
            sx={{ bgcolor: '#2563eb', color: '#fff' }}
          />
        </Box>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          {isAuthenticated && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#2563eb', width: { xs: '100%', sm: 'auto' } }}
            >
              Nuevo VSD
            </Button>
          )}
        </Box>
      </Box>

      {/* NUEVO: Búsqueda avanzada */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
            <InputLabel>Buscar por</InputLabel>
            <Select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              label="Buscar por"
            >
              <MenuItem value="todo">Todo</MenuItem>
              <MenuItem value="codigo">Código</MenuItem>
              <MenuItem value="fabricante">Fabricante</MenuItem>
              <MenuItem value="serie">Serie</MenuItem>
              <MenuItem value="kva">KVA</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            placeholder={`Buscar por ${searchType === 'todo' ? 'código, fabricante, serie o KVA' : searchType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#6b7280' }} /></InputAdornment>,
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {searchTerm && (
            <Chip
              label={`Resultados: ${filteredVsds.length}`}
              size="small"
              sx={{ bgcolor: '#2563eb', color: '#fff', fontWeight: 'bold' }}
            />
          )}
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {filteredVsds.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="textSecondary">
            {searchTerm ? 'No se encontraron VSDs' : 'No hay VSDs registrados'}
          </Typography>
          {searchTerm && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearSearch}
              sx={{ mt: 2 }}
            >
              Limpiar búsqueda
            </Button>
          )}
          {!searchTerm && isAuthenticated && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ mt: 2, bgcolor: '#2563eb' }}
            >
              Crear Primer VSD
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredVsds.map((vsd) => (
            <Grid item xs={12} sm={6} md={4} key={vsd.id}>
              <Card sx={{ 
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                {(vsd.image_url_1 || vsd.image_url_2 || vsd.image_url_3) && (
                  <Box sx={{ height: 140, bgcolor: '#f3f4f6', overflow: 'hidden' }}>
                    <img 
                      src={vsd.image_url_1 || vsd.image_url_2 || vsd.image_url_3}
                      alt={vsd.codigo_vsd}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </Box>
                )}

                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Typography variant="h6" fontWeight="bold">
                      {vsd.codigo_vsd}
                    </Typography>
                    <Chip
                      label={getStatusLabel(vsd.status)}
                      size="small"
                      sx={{ bgcolor: getStatusColor(vsd.status), color: '#fff' }}
                    />
                  </Box>

                  <Typography color="textSecondary" gutterBottom>
                    {vsd.manufacturer} - {vsd.model}
                  </Typography>

                  {vsd.serial_number && (
                    <Typography variant="caption" color="textSecondary" display="block">
                      Serie: {vsd.serial_number}
                    </Typography>
                  )}

                  {vsd.kva && (
                    <Typography variant="caption" color="textSecondary" display="block">
                      KVA: {vsd.kva}
                    </Typography>
                  )}

                  {vsd.health_score && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <SpeedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight="bold">
                        Health: {vsd.health_score}%
                      </Typography>
                    </Box>
                  )}

                  {(vsd.site || vsd.plant) && (
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <LocationOnIcon sx={{ color: '#6b7280', fontSize: 16 }} />
                      <Typography variant="caption" color="textSecondary">
                        {[vsd.site, vsd.plant, vsd.department].filter(Boolean).join(' - ')}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  <Button size="small" startIcon={<VisibilityIcon />} onClick={() => handleViewDetails(vsd)}>
                    Ver Datos
                  </Button>
                  {isAuthenticated && (
                    <>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenDialog(vsd)}>
                        Editar
                      </Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(vsd.id)}>
                        Eliminar
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Diálogo de detalles */}
      <VSDDetail
        open={detailOpen}
        vsd={selectedVSD}
        onClose={() => setDetailOpen(false)}
      />

      {/* Diálogo de edición/creación */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{editingVSD ? 'Editar VSD' : 'Nuevo VSD'}</Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código VSD *"
                value={formData.codigo_vsd}
                disabled={!!editingVSD}
                size="small"
                InputProps={{
                  readOnly: true,
                  endAdornment: !editingVSD && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={async () => {
                        const newCode = await generarCodigoVSD();
                        setFormData(prev => ({ ...prev, codigo_vsd: newCode }));
                      }}>
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                helperText={!editingVSD ? 'Código generado automáticamente' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Estado"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="activo">✅ Activo</option>
                <option value="mantenimiento">🔧 Mantenimiento</option>
                <option value="critico">🚨 Crítico</option>
                <option value="inactivo">⏸️ Inactivo</option>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fabricante"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Modelo"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Health Score (%)"
                type="number"
                value={formData.health_score}
                onChange={(e) => setFormData({ ...formData, health_score: e.target.value })}
                size="small"
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Serie"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tensión (V)"
                value={formData.voltage_rating}
                onChange={(e) => setFormData({ ...formData, voltage_rating: e.target.value })}
                size="small"
                placeholder="480V"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="KVA"
                value={formData.kva}
                onChange={(e) => setFormData({ ...formData, kva: e.target.value })}
                size="small"
                placeholder="100"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">📍 Ubicación</Typography>
              <Divider />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Sitio"
                value={formData.site}
                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Planta"
                value={formData.plant}
                onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Departamento"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">📸 Imágenes (máx 3)</Typography>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                existingImages={tempImages}
              />
              {tempImages.length >= 3 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Ya has agregado 3 imágenes. Elimina alguna para agregar otra.
                </Alert>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">📝 Observaciones</Typography>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                multiline
                rows={3}
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#2563eb' }}>
            {editingVSD ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VSDs;
