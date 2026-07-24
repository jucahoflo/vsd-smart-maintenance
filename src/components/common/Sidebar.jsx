import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Speed as SpeedIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';

const Sidebar = ({ open, setOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/vsds', icon: <SpeedIcon />, label: 'VSDs' },
    { path: '/maintenance', icon: <BuildIcon />, label: 'Mantenimiento' },
    { path: '/inventory', icon: <InventoryIcon />, label: 'Inventario' },
    { path: '/reports', icon: <AssessmentIcon />, label: 'Reportes' },
    { path: '/settings', icon: <SettingsIcon />, label: 'Configuración' },
  ];

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          paddingTop: '64px',
        },
      }}
    >
      <Box className="h-full flex flex-col">
        <Box className="p-3 flex items-center justify-between border-b border-gray-100">
          <Box display="flex" alignItems="center" gap={2}>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Typography variant="h6" className="text-white font-bold">V</Typography>
            </div>
            <Box>
              <Typography variant="subtitle1" className="font-bold text-primary-700 leading-tight">
                VSD Smart
              </Typography>
            </Box>
          </Box>
          {isMobile && (
            <IconButton onClick={() => setOpen(false)} size="small">
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>

        <List component="nav" className="flex-1 px-2 py-2">
          {menuItems.map((item) => (
            <ListItem disablePadding key={item.path}>
              <NavLink to={item.path} className="w-full" onClick={() => isMobile && setOpen(false)}>
                <ListItemButton
                  className={`rounded-lg mb-1 ${
                    location.pathname === item.path ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <ListItemIcon className={location.pathname === item.path ? 'text-primary-600' : 'text-gray-600'}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItemButton>
              </NavLink>
            </ListItem>
          ))}
        </List>

        <Divider />
        <Box className="p-3">
          <Typography variant="caption" className="text-gray-400 text-center block">
            v1.0.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;