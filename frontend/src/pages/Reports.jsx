import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip,
  CircularProgress, IconButton, Snackbar, Alert, Stack,
  TextField, InputAdornment
} from '@mui/material';
import { PictureAsPdf, Search, Refresh } from '@mui/icons-material';
import { supabase } from '../config/supabase';
import { generateMaintenancePDF } from '../components/GenerateMaintenancePDF';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      // Verificar si el VSD existe
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'online': return '🟢 Online';
      case 'offline': return '🔴 Offline';
      case 'alarm': return '🟡 Alarma';
      case 'maintenance': return '🔧 Mantenimiento';
      default: return status;
    }
  };

  // Filtrar reportes por búsqueda
  const filteredReports = reports.filter((rep) => 
    rep.codigo_vsd?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.tecnico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando reportes de mantenimiento...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="primary">
            📄 Reportes de Mantenimiento
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Historial completo de mantenimientos realizados. Descarga el PDF oficial.
          </Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar por VSD, técnico o tipo..."
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
        <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No hay reportes de mantenimiento registrados.
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            Registra un mantenimiento desde el módulo de Mantenimiento para verlo aquí.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                <TableCell sx={{ fontWeight: 700 }}>Código VSD</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Técnico</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{report.codigo_vsd}</TableCell>
                  <TableCell>
                    <Chip 
                      label={report.tipo || 'Preventivo'} 
                      size="small" 
                      color={report.tipo === 'Correctivo' ? 'error' : report.tipo === 'Predictivo' ? 'warning' : 'success'}
                    />
                  </TableCell>
                  <TableCell>{report.tecnico || 'N/A'}</TableCell>
                  <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PictureAsPdf />}
                      onClick={() => handleDownloadPDF(report)}
                      sx={{ textTransform: 'none' }}
                    >
                      Descargar PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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

export default Reports;
