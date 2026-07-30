// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { supabaseAdmin } = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 5000;

// ===========================
// MIDDLEWARES
// ===========================

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Demasiadas peticiones' }
});
app.use('/api', limiter);

// ===========================
// RUTAS
// ===========================

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: supabaseAdmin ? '✅ conectado' : '❌ no conectado',
    environment: process.env.NODE_ENV
  });
});

// Test Supabase
app.get('/api/test', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('vfds')
      .select('count')
      .limit(1);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        hint: '¿Has creado la tabla "vfds" en Supabase?'
      });
    }

    res.json({
      success: true,
      message: '✅ Conexión a Supabase exitosa',
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Importar rutas
const vfdRoutes = require('./routes/vfd.routes');
const authRoutes = require('./routes/auth.routes');

app.use('/api/vfds', vfdRoutes);
app.use('/api/auth', authRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor'
  });
});

// ===========================
// INICIAR SERVIDOR
// ===========================

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('🚀 VSD Smart Maintenance Backend');
  console.log('═══════════════════════════════════════');
  console.log(`📡 Servidor:  http://localhost:${PORT}`);
  console.log(`🔗 Supabase:  ${process.env.SUPABASE_URL}`);
  console.log(`🌍 Entorno:   ${process.env.NODE_ENV}`);
  console.log('═══════════════════════════════════════');
});

module.exports = app;