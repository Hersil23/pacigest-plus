const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');
const { createLimiter } = require('../middlewares/rateLimiter');

// ============================================
// RUTAS PÚBLICAS
// ============================================

// Obtener países disponibles
router.get('/countries', paymentController.getAvailableCountries);

// Obtener cuentas bancarias por país
router.get('/bank-accounts/:country', paymentController.getBankAccounts);

// Calcular precio de un plan
router.get('/calculate-price', paymentController.calculatePrice);

// ============================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// ============================================

// Solicitar actualización de plan
router.post('/request', protect, createLimiter, paymentController.requestPayment);

// Subir comprobante de pago
router.post('/:paymentId/upload-proof', protect, paymentController.uploadProof);

// Ver mis pagos
router.get('/my-payments', protect, paymentController.getMyPayments);

// Ver pago específico
router.get('/:id', protect, paymentController.getPaymentById);

// ============================================
// RUTAS ADMIN
// ============================================

// Ver pagos pendientes (solo para admins/doctores principales)
router.get('/admin/pending', protect, paymentController.getPendingPayments);

// Aprobar pago
router.put('/:paymentId/approve', protect, paymentController.approvePayment);

// Rechazar pago
router.put('/:paymentId/reject', protect, paymentController.rejectPayment);

module.exports = router;