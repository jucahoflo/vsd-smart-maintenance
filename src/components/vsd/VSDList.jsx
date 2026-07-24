import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Box,
  Typography,
  TextField,
  IconButton,
  Fab,
  CircularProgress,
  Chip,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Sort as SortIcon,
  CloudOff as CloudOffIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import VSDCard from './VSDCard';
import VSDForm from './VSDForm';
import { useVSD } from '../../context/VSDContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const VSDList = () => {
  const { vsds, searchVSDs, deleteVSD, isOnline, loading, loadAllData } = useVSD();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVSDs, setFilteredVSDs] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingVSD, setEditingVSD] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterEstado, setFilterEstado] = useState('todos');
  const [viewMode, setViewMode] = useState('grid');
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('nombre');

  useEffect(() => {
    const results = searchVSDs(searchTerm);
    let filtered = results;
    
    // Filtrar por estado
    if (filterEstado !== 'todos') {
      filtered = filtered.filter(vsd => vsd.estado === filterEstado);
    }
    
    // Ordenar
    filtered = sortVSDs(filtered, sortBy);
    
    setFilteredVSDs(filtered);
  }, [searchTerm, vsds, filterEstado, sortBy, searchVSDs]);

  const sortVSDs = (items, sortBy) => {
    const sorted = [...items];
    switch(sortBy) {
      case 'nombre':
        return sorted.sort((a, b) => a.nombre?.localeCompare(b.nombre || '') || 0);
      case 'fecha':
        return sorted.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
      case 'estado':
        return sorted.sort((a, b) => a.estado?.localeCompare(b.estado || '') || 0);
      case 'marca':
        return sorted.sort((a, b) => a.marca?.localeCompare(b.marca || '') || 0);
      default:
        return sorted;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este VSD? Esta acción no se puede deshacer.')) {
      try {
        await deleteVSD(id);
        toast.success('✅ VSD eliminado correctamente');
      } catch (error) {
        toast.error('Error al eliminar el VSD');
      }
    }
  };

  const handleEdit = (vsd) => {
    setEditingVSD(vsd);
    setIsEditing(true);
    setOpenForm(true);
  };

  const handleAddNew = () => {
    setEditingVSD(null);
    setIsEditing(false);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingVSD(null);
    setIsEditing(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleRefresh = async () => {
    await loadAllData();
    toast.info('Datos actualizados');
  };

  const estados = [
    { value: 'todos', label: 'Todos' },
    { value: 'activo', label: 'Activos' },
    { value: 'mantenimiento', label: 'En Mantenimiento' },
    { value: 'inactivo', label: 'Inactivos' }
  ];

  const getEstadoCount = (estado) => {
    if (estado === 'todos') return vsds.length;
    return vsds.filter(v => v.estado === estado).length;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold" className="text-gray-800">
            Variadores de Frecuencia
            <Typography variant="body2" color="textSecondary" component="span" ml={2}>
              ({filteredVSDs.length} equipos)
            </Typography>
          </Typography>
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            {estados.map((estado) => (
              <Chip
                key={estado.value}
                label={`${estado.label} (${getEstadoCount(estado.value)})`}
                onClick={() => setFilterEstado(estado.value)}
                color={filterEstado === estado.value ? 'primary' : 'default'}
                variant={filterEstado === estado.value ? 'filled' : 'outlined'}
                size="small"
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>
        </Box>

        <Box display="flex" gap={2} flexWrap="wrap">
          {!isOnline && (
            <Chip 
              icon={<CloudOffIcon />} 
              label="Modo Offline" 
              color="warning" 
              variant="outlined"
            />
          )}
          
          <Tooltip title="Actualizar datos">
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            Ordenar
          </Button>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => { setSortBy('nombre'); setAnchorEl(null); }}>
              Por Nombre
            </MenuItem>
            <MenuItem onClick={() => { setSortBy('fecha'); setAnchorEl(null); }}>
              Por Fecha (recientes)
            </MenuItem>
            <MenuItem onClick={() => { setSortBy('estado'); setAnchorEl(null); }}>
              Por Estado
            </MenuItem>
            <MenuItem onClick={() => { setSortBy('marca'); setAnchorEl(null); }}>
              Por Marca
            </MenuItem>
          </Menu>

          <Fab 
            color="primary" 
            onClick={handleAddNew}
            variant="extended"
            size="medium"
          >
            <AddIcon sx={{ mr: 1 }} />
            Nuevo VSD
          </Fab>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, serie, ubicación, marca o modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: 3, backgroundColor: 'white' }
          }}
          variant="outlined"
          size="medium"
        />
      </Box>

      {/* Grid de VSDs */}
      <AnimatePresence>
        {filteredVSDs.length === 0 ? (
          <Paper className="p-8 text-center">
            <Box py={4}>
              {searchTerm || filterEstado !== 'todos' ? (
                <>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No se encontraron resultados
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Intenta ajustar los filtros o realizar una nueva búsqueda
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setSearchTerm('');
                      setFilterEstado('todos');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No hay VSDs registrados
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    Haz clic en "Nuevo VSD" para comenzar
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={handleAddNew}
                    startIcon={<AddIcon />}
                  >
                    Crear primer VSD
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredVSDs.map((vsd, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                key={vsd._id}
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <VSDCard 
                  vsd={vsd}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClick={() => {
                    // Aquí irá la navegación al detalle
                    toast.info(`Ver detalles de ${vsd.nombre}`);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </AnimatePresence>

      {/* Modal de formulario */}
      <VSDForm 
        open={openForm} 
        onClose={handleCloseForm}
        vsdToEdit={editingVSD}
        isEditing={isEditing}
      />
    </Box>
  );
};

export default VSDList;