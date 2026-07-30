import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, useTheme, useMediaQuery, Snackbar, Alert,
  LinearProgress, Tabs, Tab
} from '@mui/material';
import {
  Add, Refresh, Edit, Delete, Search,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { inventory } from '../api/endpoints';

const Inventory = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    part_number: '',
    name: '',
    description: '',
    category: 'Electrónicos',
    quantity: 0,
    min_quantity: 5,
    location: '',
    supplier: '',
    price: 0,
    notes: ''
  });

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredItems(items.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredItems(items);
    }
  }, [searchTerm, items]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const res = await inventory.getAll();
      setItems(res.data.data || []);
      setFilteredItems(res.data.data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
      showSnackbar('Error al cargar inventario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditing(item);
      setFormData(item);
    } else {
      setEditing(null);
      setFormData({
        part_number: '',
        name: '',
        description: '',
        category: 'Electrónicos',
        quantity: 0,
        min_quantity: 5,
        location: '',
        supplier: '',
        price: 0,
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditing(null);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await inventory.update(editing.id, formData);
        showSnackbar('✅ Item actualizado');
      } else {
        await inventory.create(formData);
        showSnackbar('✅ Item agregado al inventario');
      }
      handleClose();
      loadInventory();
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este item del inventario?')) {
      try {
        await inventory.delete(id);
        showSnackbar('✅ Item eliminado');
        loadInventory();
      } catch (error) {
        showSnackbar('Error al eliminar', 'error');
      }
    }
  };

  const getStockStatus = (item) => {
    if (item.quantity <= 0) return { label: 'Sin stock', color: theme.palette.error.main };
    if (item.quantity <= item.min_quantity) return { label: 'Stock bajo', color: theme.palette.warning.main };
    return { label: 'Disponible', color: theme.palette.success.main };
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Electrónicos': theme.palette.primary.main,
      'Mecánicos': theme.palette.secondary.main,
      'Cables': theme.palette.warning.main,
      'Otros': theme.palette.grey[500]
    };
    return colors[category] || theme.palette.grey[500];
  };

  const tabs = [
    { label: 'Todos', value: 0 },
    { label: 'Disponibles', value: 1 },
    { label: 'Stock Bajo', value: 2 },
    { label: 'Sin Stock', value: 3 }
  ];

  const filteredByTab = () => {
    if (tabValue === 0) return filteredItems;
    if (tabValue === 1) return filteredItems.filter(i => i.quantity > i.min_quantity);
    if (tabValue === 2) return filteredItems.filter(i => i.quantity > 0 && i.quantity <= i.min_quantity);
    if (tabValue === 3) return filteredItems.filter(i => i.quantity <= 0);
    return filteredItems;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Cargando inventario...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2} mb={3}>
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" className="gradient-text">
            📦 Inventario
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Control de repuestos y piezas
          </Typography>
        </Box>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ minWidth: isMobile ? 120 : 200 }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{ borderRadius: 3 }}
            size={isMobile ? "small" : "medium"}
          >
            {isMobile ? 'Agregar' : 'Agregar Item'}
          </Button>
          <IconButton onClick={loadInventory} sx={{ bgcolor: 'rgba(108,99,255,0.1)' }}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} />
        ))}
      </Tabs>

      {/* Lista de items */}
      <Grid container spacing={3}>
        {filteredByTab().map((item) => {
          const stock = getStockStatus(item);
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card sx={{
                borderRadius: 4,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: isMobile ? 'none' : 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {item.part_number}
                      </Typography>
                      <Typography variant="h6" fontWeight="700">
                        {item.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={stock.label}
                      size="small"
                      sx={{
                        bgcolor: `${stock.color}20`,
                        color: stock.color,
                        fontWeight: 600,
                        fontSize: '0.6rem'
                      }}
                    />
                  </Box>

                  <Box mt={1}>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{
                        bgcolor: `${getCategoryColor(item.category)}20`,
                        color: getCategoryColor(item.category),
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>

                  <Box mt={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="textSecondary">Cantidad</Typography>
                      <Typography variant="h6" fontWeight="700">
                        {item.quantity}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((item.quantity / (item.min_quantity * 2)) * 100, 100)}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        mt: 0.5,
                        bgcolor: `${stock.color}25`,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: stock.color,
                          borderRadius: 2
                        }
                      }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      Mínimo: {item.min_quantity}
                    </Typography>
                  </Box>

                  {item.location && (
                    <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                      📍 {item.location}
                    </Typography>
                  )}
                  {item.supplier && (
                    <Typography variant="caption" color="textSecondary" display="block">
                      🏭 {item.supplier}
                    </Typography>
                  )}
                  {item.price > 0 && (
                    <Typography variant="caption" color="textSecondary" display="block">
                      💰 ${item.price}
                    </Typography>
                  )}

                  <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                    <IconButton size="small" onClick={() => handleOpen(item)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {filteredByTab().length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No hay items en el inventario
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="700">
            {editing ? '✏️ Editar Item' : '➕ Agregar Item'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Part Number"
                value={formData.part_number}
                onChange={(e) => setFormData({...formData, part_number: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  label="Categoría"
                >
                  <MenuItem value="Electrónicos">Electrónicos</MenuItem>
                  <MenuItem value="Mecánicos">Mecánicos</MenuItem>
                  <MenuItem value="Cables">Cables</MenuItem>
                  <MenuItem value="Otros">Otros</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Ubicación"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cantidad"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Stock Mínimo"
                type="number"
                value={formData.min_quantity}
                onChange={(e) => setFormData({...formData, min_quantity: parseInt(e.target.value)})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Proveedor"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Precio ($)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editing ? 'Actualizar' : 'Agregar'}
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

export default Inventory;
