import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SyncProvider } from './context/SyncContext';
import theme from './theme.js';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VFDs from './pages/VFDs';
import Maintenance from './pages/Maintenance';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SyncProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vfds" element={<VFDs />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </Router>
      </SyncProvider>
    </ThemeProvider>
  );
}

export default App;
