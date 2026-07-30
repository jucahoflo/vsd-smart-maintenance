const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API de Autenticación funcionando 🔐'
  });
});

module.exports = router;
