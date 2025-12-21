const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { authLimiter, registerLimiter, emailLimiter, passwordResetLimiter } = require('../middlewares/rateLimiter');
// Rutas públicas (sin autenticación)
router.post('/register', registerLimiter, authController.register);           // Registrar nuevo usuario
router.post('/verify-email', emailLimiter, authController.verifyEmail);    // Verificar email
router.post('/login', authLimiter, authController.login);                 // Iniciar sesión
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);

// Rutas protegidas (requieren autenticación)
router.get('/me', protect, authController.getCurrentUser);              // Obtener usuario actual
router.put('/update-profile', protect, authController.updateProfile);   // Actualizar perfil
router.put('/change-password', protect, authController.changePassword); // Cambiar contraseña

module.exports = router;