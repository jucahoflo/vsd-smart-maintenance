import React, { useState, useEffect } from 'react';
import { 
  Box, CssBaseline, Toolbar, AppBar, Typography, IconButton, Chip, 
  BottomNavigation, BottomNavigationAction, Paper, useMediaQuery, useTheme 
} from '@mui/material';
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
  const navigate = useNavigate();
  const location = useLocation();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'VFDs', icon: <VsdIcon />, path: '/vfds' },
    { text: 'Mantenimiento', icon: <MaintenanceIcon />, path: '/maintenance' },
    { text: 'Reportes', icon: <ReportsIcon />, path: '/reports' },
    { text: 'Inventario', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Renderizado del menú lateral (Solo para PC)
  const renderSidebar = () => (
    <Box sx={{ bgcolor: '#1a237e', height: '100%', color: 'white' }}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: 50, height: 50, bgcolor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ color: '#1a237e', fontWeight: 'bold' }}>⚡</Typography>
        </Box>
        <Typography variant="h6" fontWeight="700" color="white">VSD Smart</Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.7)">Maintenance System</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh' }}>
      <CssBaseline />
      
      <AppBar
        position="fixed"
        sx={{
          width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
          ml: isMobile ? 0 : `${drawerWidth}px`,
          bgcolor: '#1a237e'
        }}
      >
        <Toolbar>
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

      {/* Menú LATERAL para PC (Siempre visible y fijo) */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{ width: drawerWidth, flexShrink: 0 }}
        >
          <Box sx={{ 
            width: drawerWidth, 
            height: '100vh', 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            bgcolor: '#1a237e', 
            color: 'white',
            pt: 10 
          }}>
            {renderSidebar()}
            <Box sx={{ px: 2, mt: 4 }}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Box 
                    key={item.text} 
                    onClick={() => navigate(item.path)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 3,
                      py: 2,
                      mb: 1,
                      borderRadius: 2,
                      cursor: 'pointer',
                      bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                      color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    <Box sx={{ mr: 2, display: 'flex' }}>{item.icon}</Box>
                    <Typography variant="body1">{item.text}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
          ml: isMobile ? 0 : `${drawerWidth}px`,
          mt: 8,
          mb: isMobile ? 8 : 0, // Espacio extra abajo para el menú inferior en celular
          bgcolor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>

      {/* Menú INFERIOR para CELULAR (Siempre visible y fijo) */}
      {isMobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }} elevation={3}>
          <BottomNavigation
            value={menuItems.findIndex(item => item.path === location.pathname)}
            onChange={(event, newValue) => {
              navigate(menuItems[newValue].path);
            }}
            showLabels
            sx={{ bgcolor: '#1a237e', color: 'white', '& .MuiBottomNavigationAction-root': { color: 'rgba(255,255,255,0.7)' } }}
          >
            {menuItems.map((item) => (
              <BottomNavigationAction 
                key={item.text} 
                label={item.text} 
                icon={item.icon} 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  '&.Mui-selected': { color: 'white' } 
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default Layout;
