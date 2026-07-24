import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Fab,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useVSD } from '../context/VSDContext';
import VSDCard from '../components/vsd/VSDCard';
import VSDForm from '../components/vsd/VSDForm';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const VSDPage = () => {
  const { vsds, searchVSDs, deleteVSD, loading, loadAllData } = useVSD();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVSDs, setFilteredVSDs] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingVSD, setEditingVSD] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterEstado, setFilterEstado] = useState('todos');
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vsdToDelete, setVsdToDelete] = useState(null);

  useEffect(() => {
    let results = searchVSDs(searchTerm);
    if (filterEstado !== 'todos') {
      results = results.filter(vsd => vsd.estado === filterEstado);
    }
    setFilteredVSDs(results);
  }, [searchTerm, vsds, filterEstado, searchVSDs]);

  const handleDelete = (id) => {
    setVsdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteVSD(vsdToDelete);
      setDeleteDialogOpen(false);
      setVsdToDelete(null);
      toast.success('✅ VSD eliminado correctamente');
      await loadAllData();
    } catch (error) {
      toast.error('❌ Error al eliminar el VSD');
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

  const handleRefresh = async () => {
    await loadAllData();
    toast.info('🔄 Datos actualizados');
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
        <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
          Cargando VSDs...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold" className="text-gray-800">
            Gestión de VSDs
            <Typography variant="body2" color="textSecondary" component="span" ml={2}>
              ({filteredVSDs.length} equipos)
            </Typography>
          </Typography>
          <Box display="flex" gap={1} mt={1} flexWrap="wrap">
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
          </Box>
        </Box>

        <Box display="flex" gap={2} flexWrap="wrap">
          <IconButton onClick={handleRefresh} size="small" title="Actualizar datos">
            <RefreshIcon />
          </IconButton>
          <Fab color="primary" onClick={handleAddNew} variant="extended" size="medium">
            <AddIcon sx={{ mr: 1 }} />
            Nuevo VSD
          </Fab>
        </Box>
      </Box>

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
                <IconButton onClick={() => setSearchTerm('')} size="small">
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

      <AnimatePresence>
        {filteredVSDs.length === 0 ? (
          <Paper className="p-8 text-center">
            <Box py={4}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {searchTerm || filterEstado !== 'todos' ? 'No se encontraron resultados' : 'No hay VSDs registrados'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {searchTerm || filterEstado !== 'todos' 
                  ? 'Intenta ajustar los filtros' 
                  : 'Haz clic en "Nuevo VSD" para comenzar'}
              </Typography>
              {(searchTerm || filterEstado !== 'todos') && (
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
              )}
              {vsds.length === 0 && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={handleAddNew}
                  startIcon={<AddIcon />}
                >
                  Crear primer VSD
                </Button>
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
                />
              </Grid>
            ))}
          </Grid>
        )}
      </AnimatePresence>

      <VSDForm 
        open={openForm} 
        onClose={handleCloseForm}
        vsdToEdit={editingVSD}
        isEditing={isEditing}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ fontSize: 24 }}>⚠️</span> 
          <Typography variant="h6" fontWeight="bold">Confirmar Eliminación</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            ¿Estás seguro de que deseas eliminar este VSD?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2, bgcolor: '#fee2e2', p: 2, borderRadius: 2 }}>
            ⚠️ <strong>Esta acción no se puede deshacer.</strong>
            <br />
            Se eliminarán también todos los <strong>mantenimientos</strong> y <strong>partes</strong> asociados.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Eliminar VSD
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VSDPage;