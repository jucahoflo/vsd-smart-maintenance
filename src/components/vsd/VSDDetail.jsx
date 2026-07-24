import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  Paper,
  Divider,
  IconButton,
  Tab,
  Tabs,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Tooltip,
  ImageList,
  ImageListItem,
  Fab,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Speed as SpeedIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  PhotoCamera as PhotoCameraIcon,
  CloudUpload as CloudUploadIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useVSD } from '../../context/VSDContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const VSDDetail = ({ open, onClose, vsdId }) => {
  const { vsds, getMaintenancesByVSD, getPartsByVSD, addDocument, deleteDocument, loadAllData } = useVSD();
  const [vsd, setVsd] = useState(null);
  const [maintenances, setMaintenances] = useState([]);
  const [parts, setParts] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Estados para cámara y archivos
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState('imagenes');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadName, setUploadName] = useState('');
  
  // Estados para cámara
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (vsdId) {
      const found = vsds.find(v => v._id === vsdId);
      setVsd(found);
      if (found) {
        setMaintenances(getMaintenancesByVSD(found._id));
        setParts(getPartsByVSD(found._id));
      }
    }
  }, [vsdId, vsds, getMaintenancesByVSD, getPartsByVSD]);

  const getStatusConfig = (estado) => {
    const configs = {
      activo: { color: '#22c55e', bg: '#dcfce7', icon: <CheckCircleIcon />, label: 'Activo' },
      mantenimiento: { color: '#eab308', bg: '#fef3c7', icon: <BuildIcon />, label: 'En Mantenimiento' },
      inactivo: { color: '#ef4444', bg: '#fee2e2', icon: <ErrorIcon />, label: 'Inactivo' }
    };
    return configs[estado] || configs.activo;
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      preventivo: '🛠️ Preventivo',
      correctivo: '🔧 Correctivo',
      predictivo: '📊 Predictivo'
    };
    return tipos[tipo] || tipo;
  };

  // ============ MANEJO DE CÁMARA ============
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      toast.error('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
      setUploadPreview(imageDataUrl);
      setUploadFile(imageDataUrl);
      setUploadName(`Foto_${new Date().toISOString().slice(0,10)}`);
      stopCamera();
      toast.success('📸 Foto capturada');
    }
  };

  // ============ MANEJO DE ARCHIVOS ============
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target.result);
        setUploadFile(e.target.result);
        setUploadName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadName) {
      toast.warning('Selecciona un archivo primero');
      return;
    }

    setLoading(true);
    try {
      const docData = {
        nombre: uploadName,
        url: uploadFile,
        tipo: 'image'
      };
      
      await addDocument(vsd._id, uploadType, docData);
      setOpenUploadDialog(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadName('');
      await loadAllData();
    } catch (error) {
      console.error('Error al subir:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (tipo, docId) => {
    if (window.confirm('¿Eliminar este documento?')) {
      await deleteDocument(vsd._id, tipo, docId);
      await loadAllData();
    }
  };

  const handleOpenUpload = (tipo) => {
    setUploadType(tipo);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadName('');
    setOpenUploadDialog(true);
  };

  if (!vsd) return null;

  const statusConfig = getStatusConfig(vsd.estado);

  // Contar documentos
  const totalDocs = (vsd.documentos?.imagenes?.length || 0) + 
                    (vsd.documentos?.planos?.length || 0) + 
                    (vsd.documentos?.manuales?.length || 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <SpeedIcon sx={{ color: '#0284c7', fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold">
              {vsd.nombre}
            </Typography>
            <Chip
              icon={statusConfig.icon}
              label={statusConfig.label}
              sx={{ backgroundColor: statusConfig.bg, color: statusConfig.color, fontWeight: 600 }}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Editar VSD">
              <IconButton onClick={onClose}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Información General */}
          <Grid item xs={12}>
            <Paper className="p-4">
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Información General
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">Serie</Typography>
                  <Typography variant="body1" fontWeight="500">{vsd.serie || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">Marca</Typography>
                  <Typography variant="body1" fontWeight="500">{vsd.marca || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">Modelo</Typography>
                  <Typography variant="body1" fontWeight="500">{vsd.modelo || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">Ubicación</Typography>
                  <Typography variant="body1" fontWeight="500">{vsd.ubicacion || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">Potencia</Typography>
                  <Typography variant="body1" fontWeight="500">{vsd.potencia || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">Voltaje</Typography>
                  <Typography variant="body1" fontWeight="500">{vsd.voltage || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">Corriente</Typography>
                  <Typography variant="body1" fontWeight="500">{vsd.corriente || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">Horas de Operación</Typography>
                  <Typography variant="body1" fontWeight="500">{vsd.horasOperacion || 0} h</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Tabs */}
          <Grid item xs={12}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                <Tab label={`📋 Mantenimientos (${maintenances.length})`} />
                <Tab label={`🔧 Partes (${parts.length})`} />
                <Tab label={`📎 Documentos (${totalDocs})`} />
              </Tabs>
            </Box>

            {/* Mantenimientos */}
            {tabValue === 0 && (
              <Box sx={{ mt: 2 }}>
                {maintenances.length === 0 ? (
                  <Typography color="textSecondary">No hay mantenimientos registrados</Typography>
                ) : (
                  <List>
                    {maintenances.map((m) => (
                      <ListItem key={m._id} divider>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                              <Typography variant="subtitle2" fontWeight="bold">{m.titulo}</Typography>
                              <Chip label={getTipoLabel(m.tipo)} size="small" />
                              <Chip 
                                label={m.estado} 
                                size="small"
                                color={m.estado === 'completado' ? 'success' : m.estado === 'pendiente' ? 'warning' : 'default'}
                              />
                              {m.prioridad && (
                                <Chip 
                                  label={m.prioridad} 
                                  size="small"
                                  color={m.prioridad === 'critica' ? 'error' : m.prioridad === 'alta' ? 'warning' : 'default'}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                {m.fechaProgramada && `📅 ${format(new Date(m.fechaProgramada), 'dd MMM yyyy', { locale: es })}`}
                                {m.tecnico && ` | 👤 ${m.tecnico}`}
                                {m.costo > 0 && ` | 💰 $${m.costo}`}
                              </Typography>
                              {m.descripcion && <Typography variant="body2" sx={{ mt: 0.5 }}>{m.descripcion}</Typography>}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {/* Partes */}
            {tabValue === 1 && (
              <Box sx={{ mt: 2 }}>
                {parts.length === 0 ? (
                  <Typography color="textSecondary">No hay partes registradas</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {parts.map((p) => (
                      <Grid item xs={12} sm={6} md={4} key={p._id}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle2" fontWeight="bold">{p.nombre}</Typography>
                            <Typography variant="caption" color="textSecondary">Código: {p.codigo}</Typography>
                            <Box mt={1}>
                              <Chip label={`📦 ${p.cantidad}`} size="small" color="primary" />
                              <Chip label={`💰 $${p.precio}`} size="small" variant="outlined" sx={{ ml: 1 }} />
                            </Box>
                            {p.ubicacion && (
                              <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                                📍 {p.ubicacion}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* Documentos */}
            {tabValue === 2 && (
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Documentos del VSD
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<ImageIcon />}
                      onClick={() => handleOpenUpload('imagenes')}
                    >
                      Imagen
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<DescriptionIcon />}
                      onClick={() => handleOpenUpload('planos')}
                    >
                      Plano
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small" 
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenUpload('manuales')}
                    >
                      Manual
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  {/* Imágenes */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>🖼️ Imágenes</Typography>
                    {vsd.documentos?.imagenes?.length === 0 ? (
                      <Typography variant="caption" color="textSecondary">No hay imágenes</Typography>
                    ) : (
                      <ImageList cols={3} gap={8}>
                        {vsd.documentos.imagenes.map((img) => (
                          <ImageListItem key={img.id}>
                            <img 
                              src={img.url} 
                              alt={img.nombre} 
                              style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }}
                            />
                            <Box display="flex" justifyContent="flex-end">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleDeleteDocument('imagenes', img.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </ImageListItem>
                        ))}
                      </ImageList>
                    )}
                  </Grid>

                  {/* Planos */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>📐 Planos</Typography>
                    {vsd.documentos?.planos?.length === 0 ? (
                      <Typography variant="caption" color="textSecondary">No hay planos</Typography>
                    ) : (
                      vsd.documentos.planos.map((doc) => (
                        <Paper key={doc.id} sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">{doc.nombre}</Typography>
                          <IconButton size="small" color="error" onClick={() => handleDeleteDocument('planos', doc.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))
                    )}
                  </Grid>

                  {/* Manuales */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>📖 Manuales</Typography>
                    {vsd.documentos?.manuales?.length === 0 ? (
                      <Typography variant="caption" color="textSecondary">No hay manuales</Typography>
                    ) : (
                      vsd.documentos.manuales.map((doc) => (
                        <Paper key={doc.id} sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">{doc.nombre}</Typography>
                          <IconButton size="small" color="error" onClick={() => handleDeleteDocument('manuales', doc.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))
                    )}
                  </Grid>
                </Grid>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cerrar</Button>
        <Button variant="contained" color="primary" startIcon={<EditIcon />}>
          Editar VSD
        </Button>
      </DialogActions>

      {/* ============ DIÁLOGO DE SUBIDA ============ */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {uploadType === 'imagenes' && '🖼️ Subir Imagen'}
              {uploadType === 'planos' && '📐 Subir Plano'}
              {uploadType === 'manuales' && '📖 Subir Manual'}
            </Typography>
            <IconButton onClick={() => setOpenUploadDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {/* Vista previa de cámara */}
            {cameraActive && (
              <Box sx={{ position: 'relative', mb: 2 }}>
                <video
                  ref={videoRef}
                  style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }}
                  autoPlay
                  playsInline
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button variant="contained" color="primary" onClick={capturePhoto}>
                    📸 Capturar
                  </Button>
                  <Button variant="outlined" color="error" onClick={stopCamera}>
                    Cancelar
                  </Button>
                </Box>
              </Box>
            )}

            {/* Vista previa del archivo */}
            {uploadPreview && !cameraActive && (
              <Box sx={{ mb: 2 }}>
                <img 
                  src={uploadPreview} 
                  alt="Vista previa" 
                  style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8 }}
                />
              </Box>
            )}

            {/* Botones de carga */}
            {!cameraActive && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Nombre del documento"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  fullWidth
                />
                
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  sx={{ py: 2 }}
                >
                  Seleccionar archivo
                  <input
                    type="file"
                    hidden
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect}
                  />
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  startIcon={<PhotoCameraIcon />}
                  sx={{ py: 2 }}
                  onClick={startCamera}
                >
                  Tomar foto con cámara
                </Button>
              </Box>
            )}

            {uploadPreview && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Subir documento'}
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => {
                    setUploadPreview(null);
                    setUploadFile(null);
                    setUploadName('');
                  }}
                >
                  Cancelar
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default VSDDetail;