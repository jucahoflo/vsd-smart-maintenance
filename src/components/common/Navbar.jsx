import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useVSD } from '../../context/VSDContext';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const { isOnline } = useVSD();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/vsds', label: 'VSDs' },
    { path: '/maintenance', label: 'Mantenimiento' },
    { path: '/inventory', label: 'Inventario' },
    { path: '/reports', label: 'Reportes' },
    { path: '/settings', label: 'Configuración' },
  ];

  return (
    <AppBar 
      position="fixed"
      sx={{ 
        zIndex: 1200,
        backgroundColor: 'white',
        color: 'text.primary',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        height: '64px',
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <Toolbar sx={{ height: '64px', minHeight: '64px !important', px: { xs: 1, sm: 2, md: 3 } }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">VSD</span>
          </div>
          <Typography variant="h6" className="font-bold text-primary-700 whitespace-nowrap">
            Smart Maintenance
          </Typography>
        </div>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 4, gap: 0.5 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </Box>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <div className="relative mr-2 hidden sm:block">
            <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-40 lg:w-56 pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
            />
          </div>

          <Tooltip title={isOnline ? 'Conectado' : 'Sin conexión'}>
            <Chip
              icon={isOnline ? <WifiIcon sx={{ fontSize: 14 }} /> : <WifiOffIcon sx={{ fontSize: 14 }} />}
              label={isOnline ? 'Online' : 'Offline'}
              color={isOnline ? 'success' : 'error'}
              size="small"
              variant="outlined"
              className="hidden sm:flex"
              sx={{ height: 28 }}
            />
          </Tooltip>

          <Tooltip title="Notificaciones">
            <IconButton onClick={(e) => setNotificationAnchor(e.currentTarget)} size="small">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Perfil">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <PersonIcon sx={{ fontSize: 18 }} />
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={() => setNotificationAnchor(null)}
            PaperProps={{ sx: { width: 280, maxHeight: 400 } }}
          >
            <div className="p-3 border-b border-gray-100">
              <Typography variant="subtitle2" fontWeight="bold">Notificaciones</Typography>
            </div>
            <MenuItem onClick={() => setNotificationAnchor(null)}>
              <Typography variant="body2">No hay notificaciones nuevas</Typography>
            </MenuItem>
          </Menu>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { width: 180 } }}
          >
            <MenuItem onClick={() => setAnchorEl(null)}>
              <PersonIcon fontSize="small" className="mr-2" /> Mi Perfil
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>Configuración</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;