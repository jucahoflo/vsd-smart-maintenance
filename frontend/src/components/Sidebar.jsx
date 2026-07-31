import React from 'react';
import {
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Drawer, useTheme, useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Build as MaintenanceIcon,
  Description as ReportsIcon,
  Inventory as InventoryIcon,
  Speed as VsdIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'VFDs', icon: <VsdIcon />, path: '/vfds' },
    { text: 'Mantenimiento', icon: <MaintenanceIcon />, path: '/maintenance' },
    { text: 'Reportes Mant.', icon: <ReportsIcon />, path: '/reports' },
    { text: 'Inventario', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={!isMobile}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#1a237e',
          color: 'white',
          borderRight: 'none',
          display: 'flex',
          flexDirection: 'column'
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ 
          width: 50, 
          height: 50, 
          bgcolor: 'white', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 1
        }}>
          <Typography variant="h5" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
            ⚡
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight="700" color="white">
          VSD Smart
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.7)">
          Maintenance System
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

      <List sx={{ flexGrow: 1, px: 2, mt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                  color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'white' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 3, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="caption" color="rgba(255,255,255,0.5)">
          v2.0.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
