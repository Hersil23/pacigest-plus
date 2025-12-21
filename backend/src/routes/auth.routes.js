const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

// Rutas públicas (sin autenticación)
router.post('/register', authController.register);           // Registrar nuevo usuario
router.post('/login', authController.login);                 // Iniciar sesión

// Rutas protegidas (requieren autenticación)
router.get('/me', protect, authController.getCurrentUser);              // Obtener usuario actual
router.put('/update-profile', protect, authController.updateProfile);   // Actualizar perfil
router.put('/change-password', protect, authController.changePassword); // Cambiar contraseña

module.exports = router;