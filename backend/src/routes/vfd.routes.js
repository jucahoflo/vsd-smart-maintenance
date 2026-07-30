const express = require('express');
const router = express.Router();
const VFDController = require('../controllers/vfd.controller');
const { authMiddleware, authorize } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET - Todos los VFDs
router.get('/', VFDController.getAll);

// GET - VFD por ID
router.get('/:id', VFDController.getById);

// GET - Telemetría del VFD
router.get('/:id/telemetry', VFDController.getTelemetry);

// GET - Mantenimiento del VFD
router.get('/:id/maintenance', VFDController.getMaintenance);

// GET - Alertas del VFD
router.get('/:id/alerts', VFDController.getAlerts);

// POST - Crear VFD (supervisor/admin)
router.post('/', authorize(['supervisor', 'admin']), VFDController.create);

// PUT - Actualizar VFD (supervisor/admin)
router.put('/:id', authorize(['supervisor', 'admin']), VFDController.update);

// DELETE - Eliminar VFD (solo admin)
router.delete('/:id', authorize(['admin']), VFDController.delete);

module.exports = router;
