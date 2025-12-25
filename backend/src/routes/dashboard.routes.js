const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth');

// Todas las rutas del dashboard requieren autenticación
router.use(protect);

// Ruta para obtener estadísticas
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;