import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CircularProgress, Box, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Alert, Chip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AuthProvider, useAuth } from './context/AuthContext';

// Páginas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VSDs = lazy(() => import('./pages/VSDs'));
const Settings = lazy(() => import('./pages/Settings'));

// Componente de carga
const Loading = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
    <CircularProgress />
  </Box>
);

// Componente de Login Modal
const LoginModal = ({ open, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (onLogin(username, password)) {
      onClose();
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LockOutlinedIcon sx={{ color: '#2563eb' }} />
          <span>Acceso Administrador</span>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="dense"
            required
            autoFocus
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="dense"
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: '#2563eb' }}>
            Ingresar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Layout principal
const Layout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, logout, login } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  const handleLogin = (username, password) => {
    return login(username, password);
  };

  // Menú dinámico según autenticación
  const getMenuItems = () => {
    const items = [
      { path: '/', icon: DashboardIcon, label: 'Dashboard' },
      { path: '/vsds', icon: BuildIcon, label: 'VSDs' }
    ];
    
    // 👇 SOLO AGREGAR CONFIGURACIÓN SI ESTÁ AUTENTICADO
    if (isAuthenticated) {
      items.push({ path: '/settings', icon: SettingsIcon, label: 'Configuración' });
    }
    
    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f3f4f6' }}>
      <aside style={{ width: '256px', background: 'white', borderRight: '1px solid #e5e7eb' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>VSD Smart</h1>
        </div>
        <nav style={{ padding: '16px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#2563eb' : '#374151',
                  textDecoration: 'none',
                  marginBottom: '4px'
                }}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {/* Barra superior con botón de admin */}
        <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2} gap={2}>
          {isAuthenticated ? (
            <>
              <Chip 
                label="🔐 Administrador" 
                size="small" 
                sx={{ bgcolor: '#22c55e', color: '#fff', fontWeight: 'bold' }}
              />
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={logout}
              >
                Salir
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => setLoginOpen(true)}
              sx={{ bgcolor: '#2563eb' }}
            >
              Ingresar como Administrador
            </Button>
          )}
        </Box>

        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>

        {/* Modal de Login */}
        <LoginModal 
          open={loginOpen} 
          onClose={() => setLoginOpen(false)} 
          onLogin={handleLogin}
        />
      </main>
    </div>
  );
};

// Componente principal
const AppContent = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vsds" element={<VSDs />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
