import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip,
  CircularProgress, IconButton, Snackbar, Alert, TextField,
  InputAdornment, Stack, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { PictureAsPdf, Search, Refresh, Delete, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { generateMaintenancePDF } from '../components/GenerateMaintenancePDF';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  // Estados para eliminar con contraseña
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const MASTER_PASSWORD = 'VSD2026'; // 🔐 Contraseña para eliminar reportes

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('maintenance_logs')
        .select(`
          *,
          vsd:vsd_id ( codigo_vsd, manufacturer, model, site, plant, serial_number )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      showSnackbar('Error al cargar los reportes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDownloadPDF = async (report) => {
    try {
      if (!report.vsd) {
        showSnackbar('No se encontró información del VSD para este reporte.', 'error');
        return;
      }
      await generateMaintenancePDF(report.vsd, report);
      showSnackbar('✅ PDF generado y descargado correctamente', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showSnackbar('Error al generar el PDF', 'error');
    }
  };

  // Lógica para eliminar con contraseña
  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setDeletePassword('');
    setDeleteError('');
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletePassword !== MASTER_PASSWORD) {
      setDeleteError('❌ Contraseña incorrecta. Intenta de nuevo.');
      return;
    }

    try {
      const { error } = await supabase
        .from('maintenance_logs')
        .delete()
        .eq('id', reportToDelete.id);
      if (error) throw error;
      
      showSnackbar('✅ Reporte eliminado permanentemente', 'success');
      setDeleteDialogOpen(false);
      setReportToDelete(null);
      loadReports();
    } catch (error) {
      showSnackbar('Error al eliminar el reporte', 'error');
    }
  };

  const handleEditClick = (report) => {
    navigate(`/maintenance?reportId=${report.id}`);
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

  // Agrupar reportes por código de VSD
  const groupedReports = reports.reduce((acc, report) => {
    const codigo = report.codigo_vsd;
    if (!acc[codigo]) {
      acc[codigo] = {
        codigo_vsd: codigo,
        manufacturer: report.vsd?.manufacturer || 'Sin fabricante',
        model: report.vsd?.model || '',
        reports: []
      };
    }
    acc[codigo].reports.push(report);
    return acc;
  }, {});

  const groupedList = Object.values(groupedReports).filter(group =>
    group.codigo_vsd.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando historial de mantenimientos...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="primary">
            📄 Historial de Mantenimiento
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Visualiza el historial acumulado de mantenimientos por VSD. Descarga el PDF oficial de INEMEC.
          </Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar por código VSD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
          <IconButton onClick={loadReports} sx={{ bgcolor: 'rgba(108,99,255,0.1)' }}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {reports.length === 0 ? (
        <Card sx={{ borderRadius: 4, p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary">
              No hay reportes de mantenimiento registrados
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={1}>
              Registra un mantenimiento desde el módulo de Mantenimiento para verlo aquí.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {groupedList.map((group) => (
            <Paper key={group.codigo_vsd} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ bgcolor: '#f5f7fa', p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" fontWeight="700">
                    {group.codigo_vsd}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {group.manufacturer} {group.model}
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {group.reports.length} mantenimiento(s) registrado(s)
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#fafafa' }}>
                      <TableCell sx={{ fontWeight: 600 }}># Mto.</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Técnico</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.reports.map((report) => (
                      <TableRow key={report.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {report.maintenance_number || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={report.tipo || 'Preventivo'} 
                            size="small" 
                            color={report.tipo === 'Correctivo' ? 'error' : report.tipo === 'Predictivo' ? 'warning' : 'success'}
                          />
                        </TableCell>
                        <TableCell>{report.tecnico || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PictureAsPdf />}
                            onClick={() => handleDownloadPDF(report)}
                            sx={{ textTransform: 'none', mr: 1 }}
                          >
                            Descargar PDF
                          </Button>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEditClick(report)}
                            sx={{ mr: 1 }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeleteClick(report)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Diálogo de Confirmación de Eliminación con Contraseña */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle><Typography variant="h6" fontWeight="700" color="error">⚠️ Confirmar Eliminación</Typography></DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Esta acción es **permanente**. Para eliminar este reporte, ingresa la contraseña de seguridad.
          </Typography>
          <TextField
            fullWidth
            label="🔐 Contraseña de seguridad"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            error={!!deleteError}
            helperText={deleteError}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>Eliminar Permanentemente</Button>
        </DialogActions>
      </Dialog>

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

export default Reports;
