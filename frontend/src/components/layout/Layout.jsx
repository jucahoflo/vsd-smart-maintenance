import React from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, useMediaQuery } from '@mui/material';
import { Dashboard as DashboardIcon, Home as HomeIcon, Build as BuildIcon, Inventory as InventoryIcon, Description as DescriptionIcon, Settings as SettingsIcon, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const drawerWidth = 240;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'VSDs', icon: <HomeIcon />, path: '/vfds' },
    { text: 'Mantenimiento', icon: <BuildIcon />, path: '/maintenance' },
    { text: 'Inventario', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Reportes', icon: <DescriptionIcon />, path: '/reports' },
    { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#121212' }}>
      {/* Barra superior fija */}
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, bgcolor: '#1a1a1a' }}>
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#ffffff' }}>
            VSD Smart
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Menú lateral */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={!isMobile}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#1a1a1a', color: '#ffffff' },
        }}
      >
        <Box sx={{ overflow: 'auto', mt: 8 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{ color: location.pathname === item.path ? '#3b82f6' : '#b0b0b0' }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? '#3b82f6' : '#b0b0b0' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: '#121212',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          mt: 8, // Deja espacio para la AppBar
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
