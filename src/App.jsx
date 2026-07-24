import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { VSDProvider } from './context/VSDContext';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import VSDPage from './pages/VSDPage';
import MaintenancePage from './pages/MaintenancePage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import './index.css';

const theme = createTheme({
  palette: {
    primary: { main: '#0284c7', light: '#38bdf8', dark: '#0369a1' },
    secondary: { main: '#7c3aed', light: '#a78bfa', dark: '#6d28d9' },
    success: { main: '#22c55e' },
    warning: { main: '#eab308' },
    error: { main: '#ef4444' },
  },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
  shape: { borderRadius: 12 },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <VSDProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {/* Solo el Navbar superior */}
            <Navbar />
            
            {/* Contenido principal */}
            <main className="pt-16">
              <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 max-w-7xl">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/vsds" element={<VSDPage />} />
                  <Route path="/maintenance" element={<MaintenancePage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </div>
            </main>
          </div>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </VSDProvider>
    </ThemeProvider>
  );
}

export default App;