const express = require('express');
const router = express.Router();
const TelemetryController = require('../controllers/telemetry.controller');
const { authMiddleware, authorize } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET - Telemetría por VFD
router.get('/vfd/:vfdId', TelemetryController.getByVFD);

// GET - Última telemetría
router.get('/vfd/:vfdId/latest', TelemetryController.getLatest);

// POST - Guardar telemetría (técnico, supervisor, admin)
router.post('/', authorize(['technician', 'supervisor', 'admin']), TelemetryController.create);

module.exports = router;
