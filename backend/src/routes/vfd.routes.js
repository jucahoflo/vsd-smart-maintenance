const express = require('express');
const router = express.Router();
const VFDController = require('../controllers/vfd.controller');
const { authMiddleware, authorize } = require('../middleware/auth');

router.use(authMiddleware);

// Rutas principales
router.get('/', VFDController.getAll);
router.get('/:id', VFDController.getById);

// ✅ NUEVA: Buscar por código simple (V001, V002...)
router.get('/buscar-simple/:codigo', VFDController.buscarPorCodigoSimple);

// ✅ NUEVA: Buscar por código (VSD-2024-001)
router.get('/buscar/:codigo', VFDController.buscarPorCodigo);

// ✅ NUEVA: Reporte completo por código simple
router.get('/reporte/:codigo', VFDController.getReporteCompleto);

// CRUD
router.post('/', authorize(['supervisor', 'admin']), VFDController.create);
router.put('/:id', authorize(['supervisor', 'admin']), VFDController.update);
router.delete('/:id', authorize(['admin']), VFDController.delete);

// Otras rutas
router.get('/:id/telemetry', VFDController.getTelemetry);
router.get('/:id/maintenance', VFDController.getMaintenance);
router.get('/:id/alerts', VFDController.getAlerts);

module.exports = router;
