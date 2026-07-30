const express = require('express');
const router = express.Router();
const AlertsController = require('../controllers/alerts.controller');
const { authMiddleware, authorize } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ===========================
// RUTAS PÚBLICAS
// ===========================

// GET - Todas las alertas
router.get('/', AlertsController.getAll);

// GET - Alertas activas
router.get('/active', AlertsController.getActive);

// GET - Alertas por VFD
router.get('/vfd/:vfdId', AlertsController.getByVFD);

// ===========================
// RUTAS CON ROLES
// ===========================

// POST - Crear alerta (técnico, supervisor, admin)
router.post('/', authorize(['technician', 'supervisor', 'admin']), AlertsController.create);

// PUT - Reconocer alerta (técnico, supervisor, admin)
router.put('/:id/acknowledge', authorize(['technician', 'supervisor', 'admin']), AlertsController.acknowledge);

// PUT - Resolver alerta (técnico, supervisor, admin)
router.put('/:id/resolve', authorize(['technician', 'supervisor', 'admin']), AlertsController.resolve);

module.exports = router;
