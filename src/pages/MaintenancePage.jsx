import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Fab,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Build as BuildIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { useVSD } from '../context/VSDContext';
import MaintenanceForm from '../components/maintenance/MaintenanceForm';
import ReportGenerator from '../components/reports/ReportGenerator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const MaintenancePage = () => {
  const { maintenances, vsds, loading, loadAllData, deleteMaintenance } = useVSD();
  const [openForm, setOpenForm] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVsdId, setSelectedVsdId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAddNew = () => {
    setEditingMaintenance(null);
    setIsEditing(false);
    setSelectedVsdId(null);
    setOpenForm(true);
  };

  const handleEdit = (maintenance) => {
    setEditingMaintenance(maintenance);
    setIsEditing(true);
    setSelectedVsdId(maintenance.vsdId);
    setOpenForm(true);
  };

  const handleDelete = (id) => {
    setMaintenanceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMaintenance(maintenanceToDelete);
      setDeleteDialogOpen(false);
      setMaintenanceToDelete(null);
      await loadAllData();
      toast.success('✅ Mantenimiento eliminado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleRefresh = async () => {
    await loadAllData();
    toast.info('🔄 Datos actualizados');
  };

  const getEstadoColor = (estado) => {
    const colors = {
      pendiente: '#eab308',
      en_progreso: '#3b82f6',
      completado: '#22c55e',
      cancelado: '#6b7280'
    };
    return colors[estado] || '#6b7280';
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      preventivo: '🛠️',
      correctivo: '🔧',
      predictivo: '📊'
    };
    return icons[tipo] || '🔧';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
          Cargando mantenimientos...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Mantenimientos
            <Typography variant="body2" color="textSecondary" component="span" ml={2}>
              ({maintenances.length} registros)
            </Typography>
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <IconButton onClick={handleRefresh} size="small" title="Actualizar datos">
            <RefreshIcon />
          </IconButton>
          <Fab color="primary" onClick={handleAddNew} variant="extended" size="medium">
            <AddIcon sx={{ mr: 1 }} />
            Nuevo Mantenimiento
          </Fab>
        </Box>
      </Box>

      {/* Estadísticas rápidas */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <Paper className="p-3 text-center">
            <Typography variant="h6" fontWeight="bold" color="#eab308">
              {maintenances.filter(m => m.estado === 'pendiente').length}
            </Typography>
            <Typography variant="caption" color="textSecondary">Pendientes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper className="p-3 text-center">
            <Typography variant="h6" fontWeight="bold" color="#3b82f6">
              {maintenances.filter(m => m.estado === 'en_progreso').length}
            </Typography>
            <Typography variant="caption" color="textSecondary">En Progreso</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper className="p-3 text-center">
            <Typography variant="h6" fontWeight="bold" color="#22c55e">
              {maintenances.filter(m => m.estado === 'completado').length}
            </Typography>
            <Typography variant="caption" color="textSecondary">Completados</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper className="p-3 text-center">
            <Typography variant="h6" fontWeight="bold" color="#6b7280">
              {maintenances.filter(m => m.estado === 'cancelado').length}
            </Typography>
            <Typography variant="caption" color="textSecondary">Cancelados</Typography>
          </Paper>
        </Grid>
      </Grid>

      {maintenances.length === 0 ? (
        <Paper className="p-8 text-center">
          <BuildIcon sx={{ fontSize: 60, color: '#7c3aed', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No hay mantenimientos registrados
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Haz clic en "Nuevo Mantenimiento" para comenzar
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={handleAddNew}
            startIcon={<AddIcon />}
          >
            Crear primer mantenimiento
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {maintenances.map((m, index) => {
            const vsd = vsds.find(v => v._id === m.vsdId);
            return (
              <Grid item xs={12} md={6} lg={4} key={m._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="card-hover">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            {getTipoIcon(m.tipo)} {m.tipo}
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {m.titulo || 'Sin título'}
                          </Typography>
                        </Box>
                        <Chip
                          label={m.estado || 'Sin estado'}
                          size="small"
                          sx={{
                            backgroundColor: getEstadoColor(m.estado) + '20',
                            color: getEstadoColor(m.estado),
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {vsd ? `VSD: ${vsd.nombre}` : 'VSD no encontrado'}
                      </Typography>
                      {m.descripcion && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {m.descripcion}
                        </Typography>
                      )}
                      <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                        {m.fechaProgramada && (
                          <Chip
                            label={`📅 ${format(new Date(m.fechaProgramada), 'dd MMM yyyy', { locale: es })}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {m.tecnico && (
                          <Chip label={`👤 ${m.tecnico}`} size="small" variant="outlined" />
                        )}
                        {m.costo > 0 && (
                          <Chip label={`💰 $${m.costo}`} size="small" variant="outlined" />
                        )}
                        {m.prioridad && (
                          <Chip 
                            label={`🔴 ${m.prioridad}`} 
                            size="small" 
                            color={m.prioridad === 'critica' ? 'error' : m.prioridad === 'alta' ? 'warning' : 'default'}
                          />
                        )}
                      </Box>
                      <Box display="flex" justifyContent="flex-end" gap={1} mt={2} flexWrap="wrap">
                        <Button 
                          size="small" 
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(m)}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(m._id)}
                        >
                          Eliminar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Formulario de Mantenimiento */}
      <MaintenanceForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        maintenanceToEdit={editingMaintenance}
        isEditing={isEditing}
        vsdId={selectedVsdId}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de eliminar este mantenimiento?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenancePage;