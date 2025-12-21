const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { protect } = require('../middlewares/auth');

// Todas las rutas protegidas
router.use(protect);

// Rutas de estadísticas
router.get('/dashboard/:doctorId', statsController.getDoctorDashboard);
router.get('/patients/:doctorId', statsController.getPatientStats);
router.get('/appointments/:doctorId', statsController.getAppointmentStats);
router.get('/revenue/:doctorId', statsController.getMonthlyRevenue);
router.get('/activity/:doctorId', statsController.getRecentActivity);

module.exports = router;