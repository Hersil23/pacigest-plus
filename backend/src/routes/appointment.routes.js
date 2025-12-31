const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middlewares/auth');
const { checkSubscription } = require('../middlewares/subscription');

// Todas las rutas protegidas (autenticación + suscripción)
router.use(protect);
router.use(checkSubscription);

// Rutas de citas (SIN checkPermission temporal)
router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAllAppointments);
router.get('/doctor/:doctorId', appointmentController.getAppointmentsByDoctor);
router.get('/patient/:patientId', appointmentController.getAppointmentsByPatient);
router.get('/today/:doctorId', appointmentController.getTodaySchedule);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.patch('/:id/confirm', appointmentController.confirmAppointment);
router.patch('/:id/cancel', appointmentController.cancelAppointment);
router.patch('/:id/complete', appointmentController.completeAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;