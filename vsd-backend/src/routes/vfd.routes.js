const express = require('express');
const router = express.Router();

// Ruta temporal para probar
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de VFDs funcionando 🚀',
    data: []
  });
});

module.exports = router;
