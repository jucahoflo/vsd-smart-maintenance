require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { supabaseAdmin } = require('./config/supabase');
const { initWebSocket } = require('./websocket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Inicializar WebSocket
const io = initWebSocket(server);

// ===========================
// MIDDLEWARES
// ===========================

// CORS - Permitir todos los orígenes
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiting
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Demasiadas peticiones' }
}));

// ===========================
// HEALTH CHECK
// ===========================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: supabaseAdmin ? '✅ conectado' : '❌ no conectado',
    websocket: io ? '✅ activo' : '❌ no activo',
    environment: process.env.NODE_ENV
  });
});

// ===========================
// TEST CONEXIÓN
// ===========================
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

// ===========================
// RUTAS
// ===========================
const vfdRoutes = require('./routes/vfd.routes');
const authRoutes = require('./routes/auth.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const alertsRoutes = require('./routes/alerts.routes');
const telemetryRoutes = require('./routes/telemetry.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const uploadRoutes = require('./routes/upload.routes');

app.use('/api/vfds', vfdRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/upload', uploadRoutes);

// ===========================
// MANEJO DE ERRORES
// ===========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

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
server.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('🚀 VSD Smart Maintenance Backend');
  console.log('═══════════════════════════════════════');
  console.log(`📡 Servidor:  http://localhost:${PORT}`);
  console.log(`🔗 Supabase:  ${process.env.SUPABASE_URL}`);
  console.log(`🌍 Entorno:   ${process.env.NODE_ENV}`);
  console.log(`🔌 WebSocket: activo en ws://localhost:${PORT}`);
  console.log('═══════════════════════════════════════');
});

module.exports = { app, server, io };
const maintenanceReportRoutes = require('./routes/maintenance.report.routes');
app.use('/api/maintenance-reports', maintenanceReportRoutes);
