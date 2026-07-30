import React, { useEffect, useState, useRef } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Chip,
  Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, useTheme, LinearProgress,
  Snackbar, Alert, ImageList, ImageListItem,
  CircularProgress, useMediaQuery
} from '@mui/material';
import {
  Add, Edit, Delete, Refresh, Search, Close,
  Speed as SpeedIcon, Build as BuildIcon,
  CheckCircle as OnlineIcon, Error as OfflineIcon,
  Warning as WarningIcon, Image as ImageIcon,
  CameraAlt as CameraIcon
} from '@mui/icons-material';
import { vfds } from '../api/endpoints';
import { uploadImage, deleteImage } from '../services/imageUpload';
import { supabase } from '../config/supabase';

const VFDs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [vfdsList, setVfdsList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    manufacturer: '',
    model: '',
    serial_number: '',
    power_rating: '',
    voltage_rating: '',
    kva: '',
    site: '',
    plant: '',
    department: '',
    image_url1: '',
    image_url2: '',
    notes: ''
  });

  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  useEffect(() => {
    loadVFDs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredList(vfdsList.filter(v => 
        v.equipment_id_simple?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredList(vfdsList);
    }
  }, [searchTerm, vfdsList]);

  const loadVFDs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vfds')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVfdsList(data || []);
      setFilteredList(data || []);
    } catch (error) {
      console.error('Error loading VFDs:', error);
      showSnackbar('Error al cargar VFDs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleImageUpload = async (file, index) => {
    if (!file) return;

    try {
      setUploading(true);
      const vfdId = editing?.id;
      if (!vfdId) {
        showSnackbar('Primero guarda el VFD antes de subir imágenes', 'warning');
        return;
      }
      
      const url = await uploadImage(file, vfdId, index);
      
      if (url) {
        if (index === 1) {
          setFormData({...formData, image_url1: url});
        } else {
          setFormData({...formData, image_url2: url});
        }
        showSnackbar('✅ Imagen subida correctamente');
        loadVFDs();
      }
    } catch (error) {
      showSnackbar(error.message || 'Error al subir imagen', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(file, index);
    }
    event.target.value = '';
  };

  const handleRemoveImage = async (index) => {
    try {
      const vfdId = editing?.id;
      if (!vfdId) return;
      
      await deleteImage(vfdId, index);
      
      if (index === 1) {
        setFormData({...formData, image_url1: ''});
      } else {
        setFormData({...formData, image_url2: ''});
      }
      showSnackbar('✅ Imagen eliminada');
      loadVFDs();
    } catch (error) {
      showSnackbar('Error al eliminar imagen', 'error');
    }
  };

  const handleOpen = (vfd = null) => {
    if (vfd) {
      setEditing(vfd);
      setFormData({
        manufacturer: vfd.manufacturer || '',
        model: vfd.model || '',
        serial_number: vfd.serial_number || '',
        power_rating: vfd.power_rating !== null && vfd.power_rating !== undefined ? vfd.power_rating : '',
        voltage_rating: vfd.voltage_rating !== null && vfd.voltage_rating !== undefined ? vfd.voltage_rating : '',
        kva: vfd.kva !== null && vfd.kva !== undefined ? vfd.kva : '',
        site: vfd.site || '',
        plant: vfd.plant || '',
        department: vfd.department || '',
        image_url1: vfd.image_url1 || '',
        image_url2: vfd.image_url2 || '',
        notes: vfd.notes || ''
      });
    } else {
      setEditing(null);
      setFormData({
        manufacturer: '',
        model: '',
        serial_number: '',
        power_rating: '',
        voltage_rating: '',
        kva: '',
        site: '',
        plant: '',
        department: '',
        image_url1: '',
        image_url2: '',
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
      // Generar código automático V001, V002...
      const { data: lastVFD } = await supabase
        .from('vfds')
        .select('equipment_id_simple')
        .order('equipment_id_simple', { ascending: false })
        .limit(1);

      let newCode = 'V001';
      if (lastVFD && lastVFD.length > 0 && lastVFD[0].equipment_id_simple) {
        const lastNum = parseInt(lastVFD[0].equipment_id_simple.replace('V', ''));
        newCode = `V${String(lastNum + 1).padStart(3, '0')}`;
      }

      const dataToSend = {
        equipment_id_simple: newCode,
        manufacturer: formData.manufacturer || null,
        model: formData.model || null,
        serial_number: formData.serial_number || null,
        power_rating: formData.power_rating ? parseFloat(formData.power_rating) : null,
        voltage_rating: formData.voltage_rating ? parseInt(formData.voltage_rating) : null,
        kva: formData.kva ? parseFloat(formData.kva) : null,
        site: formData.site || null,
        plant: formData.plant || null,
        department: formData.department || null,
        image_url1: formData.image_url1 || null,
        image_url2: formData.image_url2 || null,
        notes: formData.notes || null,
        status: 'offline',
        health_score: 100
      };

      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '' || dataToSend[key] === null || dataToSend[key] === undefined) {
          delete dataToSend[key];
        }
      });

      if (editing) {
        const { error } = await supabase
          .from('vfds')
          .update(dataToSend)
          .eq('id', editing.id);
        if (error) throw error;
        showSnackbar('✅ VFD actualizado correctamente');
      } else {
        const { error } = await supabase
          .from('vfds')
          .insert([dataToSend]);
        if (error) throw error;
        showSnackbar('✅ VFD creado correctamente');
      }
      handleClose();
      loadVFDs();
    } catch (error) {
      console.error('Error al guardar:', error);
      showSnackbar(error.message || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este VFD?')) {
      try {
        const { error } = await supabase
          .from('vfds')
          .delete()
          .eq('id', id);
        if (error) throw error;
        showSnackbar('✅ VFD eliminado correctamente');
        loadVFDs();
      } catch (error) {
        showSnackbar('Error al eliminar', 'error');
      }
    }
  };

  // ... resto del código (getStatusColor, getStatusIcon, getHealthColor, VFDCard)

  return (
    <Box>
      {/* ... header ... */}
      <Grid container spacing={3}>
        {filteredList.map((vfd, index) => (
          <Grid item xs={12} sm={6} lg={4} key={vfd.id} className={`fade-in fade-in-delay-${(index % 4) + 1}`}>
            <VFDCard vfd={vfd} />
          </Grid>
        ))}
      </Grid>
      {/* ... diálogo ... */}
    </Box>
  );
};

export default VFDs;
