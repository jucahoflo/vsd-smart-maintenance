const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/maintenance.report.controller');
const { authMiddleware, authorize } = require('../middleware/auth');

router.use(authMiddleware);

// Rutas principales
router.get('/', ReportController.getAll);
router.get('/:id', ReportController.getById);
router.get('/vfd/:vfdId', ReportController.getByVFD);

// Crear y actualizar
router.post('/', authorize(['technician', 'supervisor', 'admin']), ReportController.create);
router.put('/:id', authorize(['supervisor', 'admin']), ReportController.update);
router.delete('/:id', authorize(['admin']), ReportController.delete);

// Fotos
router.post('/photo', authorize(['technician', 'supervisor', 'admin']), ReportController.addPhoto);
router.delete('/photo/:id', authorize(['supervisor', 'admin']), ReportController.deletePhoto);

module.exports = router;
