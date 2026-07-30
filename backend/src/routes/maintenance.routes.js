const express = require('express');
const router = express.Router();
const MaintenanceController = require('../controllers/maintenance.controller');
const { authMiddleware, authorize } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ===========================
// RUTAS PÚBLICAS
// ===========================
router.get('/', MaintenanceController.getAll);
router.get('/stats', MaintenanceController.getStats);
router.get('/:id', MaintenanceController.getById);
router.get('/vfd/:vfdId', MaintenanceController.getByVFD);

// ===========================
// RUTAS CON ROLES
// ===========================
router.post('/', authorize(['technician', 'supervisor', 'admin']), MaintenanceController.create);
router.put('/:id', authorize(['supervisor', 'admin']), MaintenanceController.update);
router.put('/:id/complete', authorize(['technician', 'supervisor', 'admin']), MaintenanceController.complete);
router.delete('/:id', authorize(['admin']), MaintenanceController.delete);

module.exports = router;
