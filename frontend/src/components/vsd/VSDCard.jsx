import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Button,
  Badge
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  Build as BuildIcon,
  LocationOn as LocationIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Inventory as InventoryIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import VSDImageUpload from './VSDImageUpload';

const VSDCard = ({ vsd, onEdit, onDelete, onClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered] = useState(false);
  const [openImageUpload, setOpenImageUpload] = useState(false);

  const getStatusConfig = (estado) => {
    const configs = {
      activo: { 
        color: '#22c55e', 
        bgColor: '#dcfce7', 
        icon: <CheckCircleIcon fontSize="small" />, 
        label: 'Activo' 
      },
      mantenimiento: { 
        color: '#eab308', 
        bgColor: '#fef3c7', 
        icon: <BuildIcon fontSize="small" />, 
        label: 'En Mantenimiento' 
      },
      inactivo: { 
        color: '#ef4444', 
        bgColor: '#fee2e2', 
        icon: <ErrorIcon fontSize="small" />, 
        label: 'Inactivo' 
      }
    };
    return configs[estado] || configs.activo;
  };

  const statusConfig = getStatusConfig(vsd.estado);
  const imageCount = vsd.documentos?.imagenes?.length || 0;

  const handleCardClick = () => {
    if (onClick) onClick(vsd);
  };

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    handleMenuClose();
    if (onEdit) onEdit(vsd);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    handleMenuClose();
    if (onDelete) onDelete(vsd._id);
  };

  const handleOpenImageUpload = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
    setOpenImageUpload(true);
  };

  const handleImageAdded = () => {
    if (onClick) onClick(vsd);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Card 
          className="cursor-pointer relative overflow-hidden card-hover"
          onClick={handleCardClick}
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            border: '1px solid #f3f4f6'
          }}
        >
          <Box sx={{ height: 4, backgroundColor: statusConfig.color }} />

          <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
            <Chip
              icon={statusConfig.icon}
              label={statusConfig.label}
              sx={{
                backgroundColor: statusConfig.bgColor,
                color: statusConfig.color,
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 24
              }}
              size="small"
            />
          </Box>

          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 100,
              zIndex: 10,
              opacity: isHovered ? 1 : 0.5,
              transition: 'opacity 0.3s ease'
            }}
          >
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleEdit}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} /> Editar
              </MenuItem>
              <MenuItem onClick={handleOpenImageUpload}>
                <AddPhotoAlternateIcon fontSize="small" sx={{ mr: 1 }} /> 
                {imageCount >= 4 ? 'Ver imágenes' : `Subir imagen (${imageCount}/4)`}
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Eliminar
              </MenuItem>
            </Menu>
          </Box>

          <CardContent sx={{ flex: 1, pt: 3, pb: 2 }}>
            <Box sx={{ 
              width: 60, 
              height: 60, 
              borderRadius: '12px', 
              bgcolor: imageCount > 0 ? 'transparent' : '#f0f9ff',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: 2, 
              mx: 'auto',
              overflow: 'hidden',
              border: imageCount > 0 ? '2px solid #e5e7eb' : 'none',
              position: 'relative'
            }}>
              {imageCount > 0 ? (
                <img 
                  src={vsd.documentos.imagenes[0].url} 
                  alt={vsd.nombre}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <SpeedIcon sx={{ fontSize: 30, color: '#0284c7' }} />
              )}
              {imageCount > 0 && (
                <Badge
                  badgeContent={imageCount}
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    '& .MuiBadge-badge': {
                      fontSize: 10,
                      height: 20,
                      minWidth: 20,
                    }
                  }}
                />
              )}
            </Box>

            <Typography variant="h6" align="center" gutterBottom fontWeight="bold" noWrap>
              {vsd.nombre || 'Sin nombre'}
            </Typography>

            <Box display="flex" justifyContent="center" gap={1} mb={1} flexWrap="wrap">
              <Chip 
                label={vsd.marca || 'Sin marca'} 
                size="small" 
                variant="outlined" 
                sx={{ fontSize: '0.65rem', height: 22 }} 
              />
              <Chip 
                label={vsd.modelo || 'Sin modelo'} 
                size="small" 
                variant="outlined" 
                sx={{ fontSize: '0.65rem', height: 22 }} 
              />
            </Box>

            {/* 👇 Serial debajo del modelo */}
            <Typography variant="caption" color="textSecondary" display="block" align="center" sx={{ mt: 0.5 }}>
              Serial: {vsd.serie || "N/A"}
            </Typography>

            <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mb={1}>
              <LocationIcon fontSize="small" sx={{ color: '#6b7280', fontSize: 16 }} />
              <Typography variant="body2" color="textSecondary" noWrap fontSize="0.8rem">
                {vsd.ubicacion || 'Sin ubicación'}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="center" gap={2} mt={2}>
              <Tooltip title="Imágenes">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <ImageIcon fontSize="small" sx={{ color: '#6b7280', fontSize: 16 }} />
                  <Typography variant="caption" color="textSecondary">
                    {imageCount}
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Planos">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <DescriptionIcon fontSize="small" sx={{ color: '#6b7280', fontSize: 16 }} />
                  <Typography variant="caption" color="textSecondary">
                    {vsd.documentos?.planos?.length || 0}
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Manuales">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <DescriptionIcon fontSize="small" sx={{ color: '#6b7280', fontSize: 16 }} />
                  <Typography variant="caption" color="textSecondary">
                    {vsd.documentos?.manuales?.length || 0}
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Partes">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <InventoryIcon fontSize="small" sx={{ color: '#6b7280', fontSize: 16 }} />
                  <Typography variant="caption" color="textSecondary">
                    {vsd.partes?.length || 0}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>

            {vsd.ultimoMantenimiento && (
              <Typography variant="caption" color="textSecondary" display="block" align="center" sx={{ mt: 1 }}>
                Último mantenimiento: {formatDistanceToNow(new Date(vsd.ultimoMantenimiento), { addSuffix: true, locale: es })}
              </Typography>
            )}

            <Box display="flex" justifyContent="center" gap={1} mt={2} flexWrap="wrap">
              <Button 
                size="small" 
                variant="outlined" 
                onClick={(e) => { e.stopPropagation(); handleEdit(e); }}
                startIcon={<EditIcon fontSize="small" />}
                sx={{ fontSize: '0.7rem', py: 0.5 }}
              >
                Editar
              </Button>
              <Button 
                size="small" 
                variant="contained"
                color="primary"
                onClick={(e) => { e.stopPropagation(); handleOpenImageUpload(e); }}
                startIcon={<AddPhotoAlternateIcon fontSize="small" />}
                sx={{ fontSize: '0.7rem', py: 0.5 }}
              >
                {imageCount >= 4 ? '📸 Ver' : `📸 Imagen (${imageCount}/4)`}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {openImageUpload && (
        <VSDImageUpload
          open={openImageUpload}
          onClose={() => setOpenImageUpload(false)}
          vsdId={vsd._id}
          onImageAdded={handleImageAdded}
          currentImages={vsd.documentos?.imagenes || []}
        />
      )}
    </>
  );
};

export default VSDCard;
