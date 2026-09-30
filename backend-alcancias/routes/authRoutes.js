const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Esta ruta responderá en /api/auth/google
router.post('/google', authController.loginGoogle);
router.post('/login', authController.loginManual);
router.post('/registro', authController.registro);

module.exports = router;