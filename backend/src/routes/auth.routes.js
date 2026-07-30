const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth');

// POST - Registro
router.post('/register', AuthController.register);

// POST - Login
router.post('/login', AuthController.login);

// GET - Perfil (requiere token)
router.get('/profile', authMiddleware, AuthController.getProfile);

module.exports = router;
