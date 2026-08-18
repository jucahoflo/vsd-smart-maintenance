import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requireAuth = false }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Si requiere autenticación y no está autenticado → redirigir al login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado y trata de ir al login → redirigir al dashboard
  if (isAuthenticated && window.location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
