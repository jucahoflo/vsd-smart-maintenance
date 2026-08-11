import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme.js';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';
import { SocketProvider } from './context/SocketContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SocketProvider>
        <App />
      </SocketProvider>
    </ThemeProvider>
  </React.StrictMode>
);
