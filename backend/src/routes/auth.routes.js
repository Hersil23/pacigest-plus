const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { authLimiter, registerLimiter, emailLimiter, passwordResetLimiter } = require('../middlewares/rateLimiter');

// Rutas públicas (sin autenticación)
router.post('/register', authController.register); // ← SIN RATE LIMITER
router.post('/verify-email', emailLimiter, authController.verifyEmail);
router.post('/login', authLimiter, authController.login);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);

// Rutas protegidas (requieren autenticación)
router.get('/me', protect, authController.getCurrentUser);
router.put('/update-profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;