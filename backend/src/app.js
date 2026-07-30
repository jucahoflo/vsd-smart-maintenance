const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ Backend funcionando en Vercel'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '✅ VSD Backend funcionando',
    endpoints: {
      health: '/health',
      test: '/api/test'
    }
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.url
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;
