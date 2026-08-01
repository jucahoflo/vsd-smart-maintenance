import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Toolbar, AppBar, Typography, IconButton, Chip, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Build as MaintenanceIcon,
  Description as ReportsIcon,
  Inventory as InventoryIcon,
  Speed as VsdIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Detectar cambio de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'VFDs', icon: <VsdIcon />, path: '/vfds' },
    { text: 'Mantenimiento', icon: <MaintenanceIcon />, path: '/maintenance' },
    { text: 'Reportes', icon: <ReportsIcon />, path: '/reports' },
    { text: 'Inventario', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <Box sx={{ bgcolor: '#1a237e', height: '100%', color: 'white' }}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: 50, height: 50, bgcolor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ color: '#1a237e', fontWeight: 'bold' }}>⚡</Typography>
        </Box>
        <Typography variant="h6" fontWeight="700" color="white">VSD Smart</Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.7)">Maintenance System</Typography>
      </Box>
      <List sx={{ px: 2, mt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'white' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ p: 3, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', mt: 'auto' }}>
        <Typography variant="caption" color="rgba(255,255,255,0.5)">v2.0.0</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#1a237e'
        }}
      >
        <Toolbar>
          {/* Botón de menú SOLO visible en celulares */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            VSD Smart System
          </Typography>
          <Chip 
            label={isOnline ? '🟢 Online' : '🔴 Offline'} 
            color={isOnline ? 'success' : 'error'} 
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Toolbar>
      </AppBar>

      {/* Menú para móviles (desplegable) */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawer}
        </Drawer>

        {/* Menú para PC (fijo) */}
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
